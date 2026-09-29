import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl } from '@/lib/config';
import { exchangeRefreshToken } from '@/lib/refresh-coordinator';

/**
 * Backend-for-frontend (BFF) proxy for all gateway routes.
 *
 * The browser calls this same-origin endpoint without any token. We read the
 * httpOnly `auth-token` cookie, attach it as a Bearer header to the gateway, and
 * transparently rotate the token on a 401 using the `refresh-token` cookie.
 *
 * AI/streaming routes (coaching, weekly reviews, conversations, voice) are
 * routed to a separate ai-gateway service in local dev; in production both
 * services share a single origin via ingress path-prefix routing.
 *
 * This is the ONLY browser-facing place that knows the access token, so the two
 * token stores can no longer drift and revoke each other.
 */

const AUTH_COOKIE_NAME = 'auth-token';
const REFRESH_COOKIE_NAME = 'refresh-token';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

// Request headers that must not be forwarded verbatim to the upstream gateway.
const STRIP_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'authorization',
  'cookie',
]);

// Response headers that NextResponse manages itself / shouldn't be copied.
const STRIP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
  'set-cookie',
]);

/**
 * Decode a path segment repeatedly (bounded) so nested encodings collapse:
 * Next.js decodes params once (%2e%2e → ".."), but a double-encoded segment
 * (%252e%252e → "%2e%2e") survives into the upstream URL and decodes to ".."
 * at the gateway — letting a caller reach paths outside /api/v1 with the
 * user's Bearer token attached.
 */
function decodeFully(seg: string): string {
  let out = seg;
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(out);
      if (decoded === out) break;
      out = decoded;
    } catch {
      return out; // malformed escape — keep as-is
    }
  }
  return out;
}

/**
 * Reject path segments that could traverse out of /api/v1 or smuggle path
 * separators into the upstream URL: dot-segments, decoded slashes/
 * backslashes, residual '%' (double-encoding residue), and empty segments
 * (// collapses on some upstreams). Legitimate gateway paths never contain
 * these.
 */
function isUnsafePath(pathParts: string[]): boolean {
  return pathParts.some((seg) => {
    if (seg === '') return true;
    const d = decodeFully(seg);
    return d === '.' || d === '..' || d.includes('/') || d.includes('\\') || d.includes('%');
  });
}

function buildUpstreamUrl(req: NextRequest, pathParts: string[]): string {
  const path = pathParts.join('/');
  // Route to the ai-gateway or main gateway based on the path prefix.
  return backendUrl(`/${path}`, req.nextUrl.search);
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;

  // Path-traversal guard — anything trying to escape /api/v1 (encoded or
  // not) gets a 404 without ever touching the gateway.
  if (isUnsafePath(path)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const cookieStore = await cookies();

  let accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const hadRefreshToken = !!cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  const url = buildUpstreamUrl(req, path);
  const method = req.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const baseHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) baseHeaders[key] = value;
  });

  const callGateway = (token: string | null) =>
    fetch(url, {
      method,
      headers: { ...baseHeaders, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? Buffer.from(body) : undefined,
      redirect: 'manual',
    });

  let upstream = await callGateway(accessToken);
  let rotated: { accessToken: string; refreshToken: string } | null = null;
  // True when the backend positively rejected the refresh token (401/403) or
  // a rotated token still 401'd — only then may we delete cookies. A
  // transient refresh failure (network/5xx) must keep them: the token is
  // likely still valid and wiping the session logs the user out for nothing.
  let sessionDead = false;

  // Transparent single-retry refresh on an expired access token.
  if (upstream.status === 401) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    if (refreshToken) {
      const outcome = await exchangeRefreshToken(refreshToken);
      if (outcome.kind === 'ok') {
        rotated = { accessToken: outcome.accessToken, refreshToken: outcome.refreshToken };
        accessToken = rotated.accessToken;
        upstream = await callGateway(accessToken);
        // A rotated pair that still 401s means the session was revoked
        // server-side — treat it as dead, not transient.
        if (upstream.status === 401) sessionDead = true;
      } else if (outcome.kind === 'rejected') {
        sessionDead = true;
      }
    }
  }

  // Whether the request was ever authenticated (had any token cookie). Used to
  // decide whether a 401 should clear cookies: an unauthenticated request (e.g.
  // StoreHydrator firing on the Google callback page before login completes)
  // must NOT delete cookies, or it can race with a concurrent server action
  // that just set them.
  const wasAuthenticated = accessToken !== null || hadRefreshToken;

  // Stream the response body directly instead of buffering it. This keeps
  // Server-Sent Events (e.g., /weekly-reviews/generate-stream) flowing to the
  // browser as they arrive from the gateway.
  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
  });
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) res.headers.set(key, value);
  });

  if (rotated) {
    res.cookies.set(AUTH_COOKIE_NAME, rotated.accessToken, COOKIE_OPTS);
    res.cookies.set(REFRESH_COOKIE_NAME, rotated.refreshToken, COOKIE_OPTS);
  } else if (upstream.status === 401 && wasAuthenticated && sessionDead) {
    // The refresh token was positively rejected — the session is dead, drop
    // the stale cookies. Only do this when there WAS a token; an
    // unauthenticated 401 (no cookies) must not touch cookies, or it can race
    // with a concurrent login (e.g. Google OAuth callback) that just set them.
    res.cookies.delete(AUTH_COOKIE_NAME);
    res.cookies.delete(REFRESH_COOKIE_NAME);
  }

  return res;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
