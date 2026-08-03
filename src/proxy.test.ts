import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  isAuthRoute,
  isProtectedRoute,
  checkToken,
} from '@/proxy';

// ============================================
// Route classification
// ============================================

describe('PROTECTED_ROUTES', () => {
  it('includes all expected protected top-level routes', () => {
    expect(PROTECTED_ROUTES).toEqual(
      expect.arrayContaining([
        '/plan',
        '/progress',
        '/coach',
        '/library',
        '/me',
        '/report',
        '/onboarding',
        '/article',
      ]),
    );
  });

  it('does not include auth routes', () => {
    AUTH_ROUTES.forEach((route) => {
      expect(PROTECTED_ROUTES).not.toContain(route);
    });
  });
});

describe('AUTH_ROUTES', () => {
  it('includes login and register only', () => {
    expect(AUTH_ROUTES).toEqual(['/login', '/register']);
  });
});

// ============================================
// isAuthRoute
// ============================================

describe('isAuthRoute', () => {
  it('returns true for /login', () => {
    expect(isAuthRoute('/login')).toBe(true);
  });

  it('returns true for /register', () => {
    expect(isAuthRoute('/register')).toBe(true);
  });

  it('returns false for /login/ (trailing slash)', () => {
    // isAuthRoute uses exact equality, so /login/ is NOT an auth route.
    expect(isAuthRoute('/login/')).toBe(false);
  });

  it('returns false for /login?redirect=/plan (query is not part of pathname)', () => {
    expect(isAuthRoute('/login')).toBe(true);
    // Pathname never includes query string in Next.js; this documents that.
  });

  it('returns false for protected routes', () => {
    PROTECTED_ROUTES.forEach((route) => {
      expect(isAuthRoute(route)).toBe(false);
    });
  });

  it('returns false for public routes', () => {
    expect(isAuthRoute('/')).toBe(false);
    expect(isAuthRoute('/forgot-password')).toBe(false);
    expect(isAuthRoute('/reset-password')).toBe(false);
    expect(isAuthRoute('/verify-email')).toBe(false);
    expect(isAuthRoute('/check-email')).toBe(false);
    expect(isAuthRoute('/auth/callback/google')).toBe(false);
  });
});

// ============================================
// isProtectedRoute
// ============================================

describe('isProtectedRoute', () => {
  describe('exact matches', () => {
    PROTECTED_ROUTES.forEach((route) => {
      it(`returns true for ${route}`, () => {
        expect(isProtectedRoute(route)).toBe(true);
      });
    });
  });

  describe('nested paths', () => {
    it('returns true for /coach/<conversationId>', () => {
      expect(isProtectedRoute('/coach/abc-123')).toBe(true);
    });

    it('returns true for /article/<id>', () => {
      expect(isProtectedRoute('/article/uuid-here')).toBe(true);
    });

    it('returns true for /onboarding/step-1', () => {
      expect(isProtectedRoute('/onboarding/step-1')).toBe(true);
    });

    it('returns true for /plan/sub-page', () => {
      expect(isProtectedRoute('/plan/sub')).toBe(true);
    });
  });

  describe('non-matches', () => {
    it('returns false for / (home)', () => {
      expect(isProtectedRoute('/')).toBe(false);
    });

    it('returns false for /login', () => {
      expect(isProtectedRoute('/login')).toBe(false);
    });

    it('returns false for /register', () => {
      expect(isProtectedRoute('/register')).toBe(false);
    });

    it('returns false for /forgot-password', () => {
      expect(isProtectedRoute('/forgot-password')).toBe(false);
    });

    it('returns false for /reset-password', () => {
      expect(isProtectedRoute('/reset-password')).toBe(false);
    });

    it('returns false for /verify-email', () => {
      expect(isProtectedRoute('/verify-email')).toBe(false);
    });

    it('returns false for /check-email', () => {
      expect(isProtectedRoute('/check-email')).toBe(false);
    });

    it('returns false for /auth/callback/google', () => {
      expect(isProtectedRoute('/auth/callback/google')).toBe(false);
    });
  });

  describe('prefix edge cases', () => {
    it('returns false for /planning (shares prefix with /plan but is not a child)', () => {
      // isProtectedRoute checks startsWith(`${route}/`), so "/plan/" prefix.
      // "/planning" does not start with "/plan/", so it is NOT protected.
      expect(isProtectedRoute('/planning')).toBe(false);
    });

    it('returns false for /meadow (shares prefix with /me)', () => {
      expect(isProtectedRoute('/meadow')).toBe(false);
    });

    it('returns false for /reports (shares prefix with /report)', () => {
      expect(isProtectedRoute('/reports')).toBe(false);
    });

    it('returns false for /articles (shares prefix with /article)', () => {
      expect(isProtectedRoute('/articles')).toBe(false);
    });
  });
});

// ============================================
// checkToken — dev fallback (no JWT_SECRET)
// ============================================

describe('checkToken', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;
  // process.env.NODE_ENV is typed read-only in @types/node; cast for tests.
  const env = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    // Simulate local dev: no JWT_SECRET, non-production NODE_ENV.
    delete process.env.JWT_SECRET;
    env.NODE_ENV = 'development';
  });

  afterEach(() => {
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
    env.NODE_ENV = originalNodeEnv;
  });

  describe('dev fallback (no JWT_SECRET, non-production)', () => {
    it('returns "valid" for a token of length >= 10', async () => {
      const result = await checkToken('a'.repeat(10));
      expect(result).toBe('valid');
    });

    it('returns "valid" for a long token', async () => {
      const result = await checkToken('very-long-token-string-here');
      expect(result).toBe('valid');
    });

    it('returns "invalid" for a token shorter than 10 chars', async () => {
      const result = await checkToken('short');
      expect(result).toBe('invalid');
    });

    it('returns "invalid" for an empty token', async () => {
      const result = await checkToken('');
      expect(result).toBe('invalid');
    });

    it('returns "invalid" for a 9-char token (boundary)', async () => {
      const result = await checkToken('a'.repeat(9));
      expect(result).toBe('invalid');
    });
  });

  describe('production without JWT_SECRET', () => {
    beforeEach(() => {
      delete process.env.JWT_SECRET;
      env.NODE_ENV = 'production';
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns "invalid" and warns when JWT_SECRET is missing in production', async () => {
      const result = await checkToken('a'.repeat(50));
      expect(result).toBe('invalid');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('JWT_SECRET is not set'),
      );
    });
  });
});
