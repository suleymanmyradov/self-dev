import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'auth-token';

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token in cookie
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!authToken;

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
