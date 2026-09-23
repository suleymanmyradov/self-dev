import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeProtectedHeader, importSPKI, jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'auth-token';
const REFRESH_COOKIE_NAME = 'refresh-token';

// JWT config (server-side env vars — never exposed to the browser).
// JWT_PUBLIC_KEY is the ES256 public key (PEM) matching the auth service's
// private signing key — a leaked public key cannot mint tokens.
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
const JWT_ISSUER = process.env.JWT_ISSUER || 'growth-auth';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'growth-api';

// Env vars carry PEMs on one line with literal \n escapes.
function normalizePem(pem: string): string {
  return pem.replace(/\\n/g, '\n');
}

// importSPKI is async — parse once and reuse the promise across requests.
let es256KeyPromise: ReturnType<typeof importSPKI> | null = null;
function getES256Key() {
  if (!JWT_PUBLIC_KEY) return null;
  es256KeyPromise ??= importSPKI(normalizePem(JWT_PUBLIC_KEY), 'ES256');
  return es256KeyPromise;
}

// Routes that require authentication
// Note: /article and /library are intentionally public — they serve
// crawlable marketing/SEO content. Per-user state (isLiked/isSaved) is
// handled client-side and degrades gracefully for anonymous visitors.
export const PROTECTED_ROUTES = [
  '/plan',
  '/progress',
  '/coach',
  '/me',
  '/report',
  '/onboarding',
];

// Routes that should be accessible only when NOT authenticated
export const AUTH_ROUTES = ['/login', '/register'];

/** Whether a pathname matches an auth-only route (login, register). */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

/** Whether a pathname matches a protected route (requires authentication). */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

// API routes that should bypass auth check (handled by their own logic).
// The former /api/chat route was removed: onboarding habit generation now goes
// through the authenticated backend gateway at /api/v1/personalization/onboarding-habits.
const PUBLIC_API_ROUTES: string[] = [];

export type TokenStatus = 'valid' | 'expired' | 'invalid';

/**
 * Check the access token locally.
 * Returns 'valid', 'expired', or 'invalid' so callers can decide whether to
 * attempt a silent refresh.
 */
export async function checkToken(token: string): Promise<TokenStatus> {
  if (!JWT_PUBLIC_KEY) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[proxy] JWT_PUBLIC_KEY is not set; treating tokens as invalid.',
      );
      return 'invalid';
    }
    // Development fallback — require a non-trivial token string
    return token.length >= 10 ? 'valid' : 'invalid';
  }

  // Dispatch on the token's alg — only ES256 is accepted. Anything else
  // (including HS256 signed with the public key PEM) is invalid, which
  // prevents algorithm-confusion attacks.
  let alg: string | undefined;
  try {
    alg = decodeProtectedHeader(token).alg;
  } catch {
    return 'invalid';
  }

  try {
    // clockTolerance must be ≤ the backend's DefaultLeeway (30s). With a
    // larger value, the proxy considers a token "valid" after the backend
    // has already expired it, causing 401s in server components. Using 0
    // ensures the proxy refreshes as soon as the token expires, well before
    // the backend would reject it (the backend's 30s leeway covers clock skew).
    if (alg !== 'ES256') return 'invalid';
    const key = await getES256Key();
    if (!key) return 'invalid';
    const { payload } = await jwtVerify(token, key, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: 0,
    });
    return payload.typ === 'access' ? 'valid' : 'invalid';
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'ERR_JWT_EXPIRED') return 'expired';
    return 'invalid';
  }
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

/**
 * Exchange a refresh token for a fresh token pair via the backend gateway.
 */
async function tryRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  // Normalize to a bare origin so a value with a trailing /api/v1 can't double the prefix.
  const apiUrl = (process.env.NEXT_PUBLIC_API_PROXY_URL || 'http://localhost:8080')
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/, '');
  try {
    const res = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const { accessToken, refreshToken: newRefreshToken } = data;
    if (!accessToken || !newRefreshToken) return null;
    return { accessToken, refreshToken: newRefreshToken };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let authenticated = false;

  if (authToken) {
    const status = await checkToken(authToken);

    if (status === 'valid') {
      authenticated = true;
    } else if (status === 'expired') {
      // Silently rotate the token so the user isn't interrupted every 15 min.
      const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
      if (refreshToken) {
        const refreshed = await tryRefresh(refreshToken);
        if (refreshed) {
          authenticated = true;

          // Redirect authenticated users away from auth pages
          if (isAuthRoute(pathname)) {
            return NextResponse.redirect(new URL('/plan', request.url));
          }

          // Mutate the request so server components receive the fresh token,
          // and set Set-Cookie so the browser's cookie store is updated too.
          request.cookies.set(AUTH_COOKIE_NAME, refreshed.accessToken);
          request.cookies.set(REFRESH_COOKIE_NAME, refreshed.refreshToken);
          const response = NextResponse.next({ request });
          response.cookies.set(AUTH_COOKIE_NAME, refreshed.accessToken, COOKIE_OPTS);
          response.cookies.set(REFRESH_COOKIE_NAME, refreshed.refreshToken, COOKIE_OPTS);
          return response;
        }
      }
      // Refresh failed — fall through to unauthenticated handling
    }
    // status === 'invalid' → authenticated stays false
  }

  // Redirect authenticated users away from auth pages
  if (authenticated && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/plan', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!authenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
