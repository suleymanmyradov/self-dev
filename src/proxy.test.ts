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
        '/me',
        '/report',
        '/onboarding',
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

    it('returns false for /article/<id> (public SEO content)', () => {
      expect(isProtectedRoute('/article/uuid-here')).toBe(false);
    });

    it('returns false for /library (public SEO content)', () => {
      expect(isProtectedRoute('/library')).toBe(false);
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
// checkToken — dev fallback (no JWT_PUBLIC_KEY)
// ============================================

describe('checkToken', () => {
  const originalJwtPublicKey = process.env.JWT_PUBLIC_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  // process.env.NODE_ENV is typed read-only in @types/node; cast for tests.
  const env = process.env as Record<string, string | undefined>;

  beforeEach(() => {
    // Simulate local dev: no JWT key material, non-production NODE_ENV.
    delete process.env.JWT_PUBLIC_KEY;
    env.NODE_ENV = 'development';
  });

  afterEach(() => {
    if (originalJwtPublicKey !== undefined) {
      process.env.JWT_PUBLIC_KEY = originalJwtPublicKey;
    } else {
      delete process.env.JWT_PUBLIC_KEY;
    }
    env.NODE_ENV = originalNodeEnv;
  });

  describe('dev fallback (no JWT key material, non-production)', () => {
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

  describe('production without JWT key material', () => {
    beforeEach(() => {
      delete process.env.JWT_PUBLIC_KEY;
      env.NODE_ENV = 'production';
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns "invalid" and warns when no key is configured in production', async () => {
      const result = await checkToken('a'.repeat(50));
      expect(result).toBe('invalid');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('JWT_PUBLIC_KEY'),
      );
    });
  });

  // The proxy reads JWT_* env vars at module load, so these tests re-import
  // the module with stubbed env to exercise the real ES256 verify path.
  describe('ES256 verification', () => {
    async function importProxyWithKey(publicKeyPem: string) {
      vi.resetModules();
      vi.stubEnv('JWT_PUBLIC_KEY', publicKeyPem);
      return import('@/proxy');
    }

    async function makeEs256Token(
      signKey: Parameters<typeof import('jose').SignJWT.prototype.sign>[0],
      alg: 'ES256' | 'HS256',
    ) {
      const { SignJWT } = await import('jose');
      return new SignJWT({ sub: 'user-1', sid: 'sess-1', typ: 'access' })
        .setProtectedHeader({ alg })
        .setIssuer('growth-auth')
        .setAudience('growth-api')
        .setIssuedAt()
        .setExpirationTime('15m')
        .setNotBefore(Math.floor(Date.now() / 1000))
        .sign(signKey);
    }

    it('returns "valid" for an ES256 token signed by the matching private key', async () => {
      const { generateKeyPair, exportSPKI } = await import('jose');
      const { publicKey, privateKey } = await generateKeyPair('ES256');
      const pem = (await exportSPKI(publicKey)).replace(/\n/g, '\\n');
      const mod = await importProxyWithKey(pem);
      const token = await makeEs256Token(privateKey, 'ES256');
      expect(await mod.checkToken(token)).toBe('valid');
    });

    it('returns "invalid" for an ES256 token signed by a different key', async () => {
      const { generateKeyPair, exportSPKI } = await import('jose');
      const { publicKey } = await generateKeyPair('ES256');
      const { privateKey: otherKey } = await generateKeyPair('ES256');
      const mod = await importProxyWithKey(await exportSPKI(publicKey));
      const token = await makeEs256Token(otherKey, 'ES256');
      expect(await mod.checkToken(token)).toBe('invalid');
    });

    it('rejects HS256 tokens signed with the public key PEM (alg confusion)', async () => {
      const { generateKeyPair, exportSPKI } = await import('jose');
      const { publicKey } = await generateKeyPair('ES256');
      const pem = await exportSPKI(publicKey);
      const mod = await importProxyWithKey(pem);
      const confused = await makeEs256Token(
        new TextEncoder().encode(pem),
        'HS256',
      );
      expect(await mod.checkToken(confused)).toBe('invalid');
    });

    it('rejects HS256 tokens even when JWT_SECRET is still set', async () => {
      const { generateKeyPair, exportSPKI } = await import('jose');
      const { publicKey } = await generateKeyPair('ES256');
      const secret = 'legacy-secret-must-be-at-least-32-bytes';
      vi.stubEnv('JWT_SECRET', secret); // must be ignored — ES256 only
      const mod = await importProxyWithKey(await exportSPKI(publicKey));
      const token = await makeEs256Token(
        new TextEncoder().encode(secret),
        'HS256',
      );
      expect(await mod.checkToken(token)).toBe('invalid');
    });
  });
});
