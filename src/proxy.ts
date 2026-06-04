import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'auth-token';

// JWT config (server-side env vars — never exposed to the browser)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || 'growth-auth';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'growth-api';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/habits',
  '/goals',
  '/activity',
  '/profile',
  '/settings',
  '/appearance',
  '/saved',
  '/report',
  '/weekly-review',
  '/ai-coach',
  '/onboarding',
  '/explore',
  '/community',
  '/search',
  '/article',
];

// Routes that should be accessible only when NOT authenticated
const AUTH_ROUTES = ['/login', '/register'];

// API routes that should bypass auth check (handled by their own logic)
const PUBLIC_API_ROUTES = ['/api/chat'];

/**
 * Verify the access token locally.
 * In production JWT_SECRET must be set and match the backend signer.
 * Falls back to a basic presence check in development when the secret is absent.
 */
async function verifyToken(token: string): Promise<boolean> {
  if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      // In production JWT_SECRET is mandatory
      return false;
    }
    // Development fallback — require a non-trivial token string
    return token.length >= 10;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: 60,
    });

    // Ensure this is an access token, not a refresh token
    if (payload.typ !== 'access') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token in cookie and verify it
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = authToken ? await verifyToken(authToken) : false;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL('/habits', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isAuthenticated && isProtected) {
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
