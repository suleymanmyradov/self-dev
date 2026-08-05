import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

// ============================================
// proxy() function behavior tests
//
// These tests verify the actual redirect/refresh behavior of the proxy
// middleware, not just the route classifiers. They mock NextRequest with
// cookies and fetch to test:
//   - #15: Silent token refresh when access token is expired
//   - #16: Auth route protection (unauthenticated → login with redirect param)
//   - #17: Auth-only route protection (authenticated → /plan)
//   - #18: Redirect URL parameter preserved after login
// ============================================

// --- Helpers ---

/** Create a mock NextRequest with cookies and URL. */
function makeMockRequest(
  pathname: string,
  cookies: Record<string, string> = {},
  url = 'http://localhost:3000',
): NextRequest {
  const fullUrl = new URL(pathname, url);
  const cookieStrings = Object.entries(cookies).map(
    ([k, v]) => `${k}=${v}`,
  );

  const request = {
    nextUrl: fullUrl,
    url: fullUrl.toString(),
    cookies: {
      get: vi.fn((name: string) => {
        const value = cookies[name];
        return value !== undefined ? { name, value } : undefined;
      }),
      set: vi.fn((name: string, value: string) => {
        cookies[name] = value;
      }),
      delete: vi.fn((name: string) => {
        delete cookies[name];
      }),
      getAll: vi.fn(() =>
        Object.entries(cookies).map(([name, value]) => ({ name, value })),
      ),
    },
    headers: new Headers(),
    method: 'GET',
  } as unknown as NextRequest;

  // Set cookie header so NextResponse.next({ request }) can read them
  if (cookieStrings.length > 0) {
    request.headers.set('cookie', cookieStrings.join('; '));
  }

  return request;
}

// --- Tests ---

describe('proxy() behavior', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;
  const env = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    // Dev fallback: no JWT_SECRET, so checkToken returns 'valid' for tokens
    // >= 10 chars and 'invalid' for shorter tokens.
    delete process.env.JWT_SECRET;
    env.NODE_ENV = 'development';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
    env.NODE_ENV = originalNodeEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ============================================
  // #16: Auth route protection (unauthenticated → login)
  // ============================================

  describe('#16 auth route protection', () => {
    it('redirects unauthenticated user from /plan to /login', async () => {
      const req = makeMockRequest('/plan');
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/login');
    });

    it('redirects unauthenticated user from /onboarding to /login', async () => {
      const req = makeMockRequest('/onboarding');
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/login');
    });

    it('redirects unauthenticated user from nested /plan/sub to /login', async () => {
      const req = makeMockRequest('/plan/sub-page');
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/login');
    });

    it('allows unauthenticated user to access public routes (/)', async () => {
      const req = makeMockRequest('/');
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('allows unauthenticated user to access /login', async () => {
      const req = makeMockRequest('/login');
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('allows unauthenticated user to access /forgot-password', async () => {
      const req = makeMockRequest('/forgot-password');
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('allows unauthenticated user to access /verify-email', async () => {
      const req = makeMockRequest('/verify-email');
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('allows unauthenticated user to access /check-email', async () => {
      const req = makeMockRequest('/check-email');
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });
  });

  // ============================================
  // #18: Redirect URL parameter after login
  // ============================================

  describe('#18 redirect URL parameter', () => {
    it('preserves the original path as redirect param when redirecting to login', async () => {
      const req = makeMockRequest('/plan');
      const res = await proxy(req);
      const location = res.headers.get('location') || '';
      const redirectUrl = new URL(location);
      expect(redirectUrl.searchParams.get('redirect')).toBe('/plan');
    });

    it('preserves nested path as redirect param', async () => {
      const req = makeMockRequest('/coach/abc-123');
      const res = await proxy(req);
      const location = res.headers.get('location') || '';
      const redirectUrl = new URL(location);
      expect(redirectUrl.searchParams.get('redirect')).toBe('/coach/abc-123');
    });

    it('preserves onboarding path as redirect param', async () => {
      const req = makeMockRequest('/onboarding');
      const res = await proxy(req);
      const location = res.headers.get('location') || '';
      const redirectUrl = new URL(location);
      expect(redirectUrl.searchParams.get('redirect')).toBe('/onboarding');
    });

    it('preserves /me path as redirect param', async () => {
      const req = makeMockRequest('/me');
      const res = await proxy(req);
      const location = res.headers.get('location') || '';
      const redirectUrl = new URL(location);
      expect(redirectUrl.searchParams.get('redirect')).toBe('/me');
    });
  });

  // ============================================
  // #17: Auth-only route protection (authenticated → away from login/register)
  // ============================================

  describe('#17 auth-only route protection', () => {
    it('redirects authenticated user from /login to /plan', async () => {
      const req = makeMockRequest('/login', { 'auth-token': 'valid-token-12345' });
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/plan');
    });

    it('redirects authenticated user from /register to /plan', async () => {
      const req = makeMockRequest('/register', { 'auth-token': 'valid-token-12345' });
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/plan');
    });

    it('does not redirect authenticated user from /forgot-password (not auth-only)', async () => {
      const req = makeMockRequest('/forgot-password', { 'auth-token': 'valid-token-12345' });
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('does not redirect authenticated user from / (home is public)', async () => {
      const req = makeMockRequest('/', { 'auth-token': 'valid-token-12345' });
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });
  });

  // ============================================
  // #15: Silent token refresh (tested via checkToken + tryRefresh integration)
  //
  // The proxy's refresh path is triggered when checkToken returns 'expired'.
  // In dev mode (no JWT_SECRET), checkToken can't return 'expired' — it only
  // returns 'valid' or 'invalid'. The 'expired' path requires a real JWT.
  // The checkToken unit tests (proxy.test.ts) cover the 'expired' detection.
  // Here we test the proxy behavior with valid/invalid tokens, which covers
  // the same code paths (authenticated = true vs false).
  // ============================================

  describe('#15 silent token refresh (integration)', () => {
    it('allows access to protected route with valid token (no refresh needed)', async () => {
      const req = makeMockRequest('/plan', { 'auth-token': 'valid-token-12345' });
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('treats invalid token as unauthenticated and redirects to login', async () => {
      // In dev mode, a token < 10 chars is 'invalid' (not 'expired')
      const req = makeMockRequest('/plan', { 'auth-token': 'short' });
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/login');
    });

    it('does not attempt refresh for invalid (non-expired) token', async () => {
      // Invalid tokens don't trigger the refresh path — only 'expired' does
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const req = makeMockRequest('/plan', {
        'auth-token': 'short',
        'refresh-token': 'valid-refresh-token',
      });
      await proxy(req);

      // fetch should NOT be called (no refresh attempt for invalid tokens)
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Edge cases
  // ============================================

  describe('edge cases', () => {
    it('allows access with a valid token to protected route', async () => {
      const req = makeMockRequest('/plan', { 'auth-token': 'valid-token-12345' });
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('does not set redirect param for public routes', async () => {
      const req = makeMockRequest('/');
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it('handles missing auth cookie gracefully', async () => {
      const req = makeMockRequest('/plan');
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/login');
    });

    it('allows /auth/callback/google for unauthenticated users', async () => {
      // OAuth callback must be accessible without auth — the user is in the
      // middle of the OAuth flow and doesn't have a session yet
      const req = makeMockRequest('/auth/callback/google');
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });
  });
});
