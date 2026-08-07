import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { backendUrl, config } from '@/lib/config';

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

function buildUpstreamUrl(req: NextRequest, pathParts: string[]): string {
  const path = pathParts.join('/');
  // Route to the ai-gateway or main gateway based on the path prefix.
  return backendUrl(`/${path}`, req.nextUrl.search);
}

async function exchangeRefreshToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${config.apiProxyUrl}${config.apiPrefix}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as
      | { accessToken?: string; refreshToken?: string }
      | null;
    if (!data?.accessToken || !data?.refreshToken) return null;
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch {
    return null;
  }
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
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

  // Transparent single-retry refresh on an expired access token.
  if (upstream.status === 401) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    if (refreshToken) {
      rotated = await exchangeRefreshToken(refreshToken);
      if (rotated) {
        accessToken = rotated.accessToken;
        upstream = await callGateway(accessToken);
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
  } else if (upstream.status === 401 && wasAuthenticated) {
    // Session was authenticated but is now dead (expired/revoked tokens) — drop
    // the stale cookies. Only do this when there WAS a token; an unauthenticated
    // 401 (no cookies) must not touch cookies, or it can race with a concurrent
    // login (e.g. Google OAuth callback) that just set them.
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
