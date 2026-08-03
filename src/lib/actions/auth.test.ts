import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================
// Mocks — must be set up before importing the module under test
// ============================================

// --- Cookie store mock ---
type CookieMap = Map<string, string>;
let cookieStore: CookieMap;

const mockCookieGet = vi.fn((name: string) => {
  const value = cookieStore.get(name);
  return value !== undefined ? { name, value } : undefined;
});
const mockCookieSet = vi.fn((name: string, value: string) => {
  cookieStore.set(name, value);
});
const mockCookieDelete = vi.fn((name: string) => {
  cookieStore.delete(name);
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
    set: mockCookieSet,
    delete: mockCookieDelete,
  })),
}));

// --- redirect mock (Next.js redirect throws internally; mock as no-op) ---
const mockRedirect = vi.fn((path: string) => {
  // In real Next.js, redirect() throws a NEXT_REDIRECT error. For testing,
  // we just record the call and return — the action resolves normally.
  void path;
});
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

// --- serverPost mock (avoids 'server-only' import) ---
// Type the mock with serverPost's signature so .mock.calls indices type-check.
const mockServerPost = vi.fn<
  (url: string, data?: unknown, params?: Record<string, unknown>, timeout?: number) => Promise<unknown>
>(async () => undefined);
vi.mock('@/lib/server-api', () => ({
  serverPost: (...args: Parameters<typeof mockServerPost>) => mockServerPost(...args),
}));

// --- fetch mock (used by publicPost in auth actions) ---
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ============================================
// Import the module under test (after mocks are set up)
// ============================================

const {
  loginAction,
  registerAction,
  verifyEmailAction,
  resendVerificationAction,
  googleLoginAction,
  forgotPasswordAction,
  resetPasswordAction,
  logoutAction,
} = await import('@/lib/actions/auth');

// ============================================
// Helpers
// ============================================

/** Build a FormData from key-value pairs. */
function formData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

/** Configure mockFetch to return a successful JSON response. */
function mockFetchSuccess(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => body,
  });
}

/** Configure mockFetch to return an error response. */
function mockFetchError(status: number, body: { message?: string; error?: string }) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => body,
  });
}

/** A valid AuthResponse body (matches AuthResponseSchema). */
function validAuthResponse() {
  return {
    accessToken: 'access-token-abc',
    refreshToken: 'refresh-token-xyz',
    expiresIn: 900,
    user: {
      id: 'usr_123',
      fullName: 'Jane Doe',
      username: 'janedoe',
      email: 'jane@example.com',
      bio: '',
      location: '',
      website: '',
      interests: [],
      avatarUrl: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      emailVerified: true,
    },
  };
}

/** A valid RegisterResponse body. */
function validRegisterResponse() {
  return {
    requiresVerification: true,
    message: 'Check your email to verify your account.',
  };
}

const STRONG_PASSWORD = 'Abcdef1!';

// ============================================
// Tests
// ============================================

describe('auth server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore = new Map();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------
  // loginAction
  // -------------------------------------------
  describe('loginAction', () => {
    it('returns success with user and tokens on valid credentials', async () => {
      mockFetchSuccess(validAuthResponse());

      const result = await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('jane@example.com');
      expect(result.accessToken).toBe('access-token-abc');
      expect(result.refreshToken).toBe('refresh-token-xyz');
    });

    it('sets auth cookies on success', async () => {
      mockFetchSuccess(validAuthResponse());

      await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: STRONG_PASSWORD,
      }));

      expect(mockCookieSet).toHaveBeenCalledWith(
        'auth-token',
        'access-token-abc',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(mockCookieSet).toHaveBeenCalledWith(
        'refresh-token',
        'refresh-token-xyz',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });

    it('calls the gateway /auth/login endpoint', async () => {
      mockFetchSuccess(validAuthResponse());

      await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: STRONG_PASSWORD,
      }));

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/v1/auth/login');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.email).toBe('jane@example.com');
      expect(body.password).toBe(STRONG_PASSWORD);
    });

    it('returns field errors when email is empty', async () => {
      const result = await loginAction({ success: false }, formData({
        email: '',
        password: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.email).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns field errors when password is too short', async () => {
      const result = await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: 'short',
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.password).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns error message on invalid credentials (401)', async () => {
      mockFetchError(401, { message: 'invalid credentials' });

      const result = await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: 'wrongpassword1',
      }));

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid credentials');
    });

    it('returns error message on unverified email (403)', async () => {
      mockFetchError(403, { message: 'email not verified' });

      const result = await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(false);
      expect(result.error).toBe('email not verified');
    });

    it('returns a generic error when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('does NOT set cookies on failure', async () => {
      mockFetchError(401, { message: 'invalid credentials' });

      await loginAction({ success: false }, formData({
        email: 'jane@example.com',
        password: 'wrongpassword1',
      }));

      expect(mockCookieSet).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // registerAction
  // -------------------------------------------
  describe('registerAction', () => {
    function validRegisterFormData() {
      return formData({
        fullName: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        password: STRONG_PASSWORD,
      });
    }

    it('returns success with requiresVerification on valid registration', async () => {
      mockFetchSuccess(validRegisterResponse());

      const result = await registerAction({ success: false }, validRegisterFormData());

      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
      expect(result.message).toBe('Check your email to verify your account.');
    });

    it('does NOT set auth cookies (verification required, no tokens)', async () => {
      mockFetchSuccess(validRegisterResponse());

      await registerAction({ success: false }, validRegisterFormData());

      expect(mockCookieSet).not.toHaveBeenCalled();
    });

    it('calls the gateway /auth/register endpoint', async () => {
      mockFetchSuccess(validRegisterResponse());

      await registerAction({ success: false }, validRegisterFormData());

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/v1/auth/register');
      const body = JSON.parse(options.body);
      expect(body.fullName).toBe('Jane Doe');
      expect(body.username).toBe('janedoe');
      expect(body.email).toBe('jane@example.com');
    });

    it('returns field errors when username is too short', async () => {
      const result = await registerAction({ success: false }, formData({
        fullName: 'Jane Doe',
        username: 'ab',
        email: 'jane@example.com',
        password: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.username).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns field errors when password is weak', async () => {
      const result = await registerAction({ success: false }, formData({
        fullName: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'alllowercase',
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.password).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns error on duplicate user (AlreadyExists)', async () => {
      mockFetchError(409, { message: 'user already exists' });

      const result = await registerAction({ success: false }, validRegisterFormData());

      expect(result.success).toBe(false);
      expect(result.error).toBe('user already exists');
    });
  });

  // -------------------------------------------
  // verifyEmailAction
  // -------------------------------------------
  describe('verifyEmailAction', () => {
    it('returns success with user and tokens on valid token', async () => {
      mockFetchSuccess(validAuthResponse());

      const result = await verifyEmailAction('valid-token-abc');

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('jane@example.com');
      expect(result.accessToken).toBe('access-token-abc');
    });

    it('sets auth cookies on success (user is logged in immediately)', async () => {
      mockFetchSuccess(validAuthResponse());

      await verifyEmailAction('valid-token-abc');

      expect(mockCookieSet).toHaveBeenCalledWith(
        'auth-token',
        'access-token-abc',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('calls the gateway /auth/verify-email endpoint with the token', async () => {
      mockFetchSuccess(validAuthResponse());

      await verifyEmailAction('valid-token-abc');

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.token).toBe('valid-token-abc');
    });

    it('returns error when token is empty', async () => {
      const result = await verifyEmailAction('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Verification token is required.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns error on invalid or expired token', async () => {
      mockFetchError(401, { message: 'invalid or expired verification token' });

      const result = await verifyEmailAction('bad-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid or expired verification token');
    });

    it('does NOT set cookies on failure', async () => {
      mockFetchError(401, { message: 'invalid or expired verification token' });

      await verifyEmailAction('bad-token');

      expect(mockCookieSet).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // resendVerificationAction
  // -------------------------------------------
  describe('resendVerificationAction', () => {
    it('returns success with a no-leak message on valid email', async () => {
      mockFetchSuccess({});

      const result = await resendVerificationAction('jane@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toContain('If the email is registered');
    });

    it('calls the gateway /auth/resend-verification endpoint', async () => {
      mockFetchSuccess({});

      await resendVerificationAction('jane@example.com');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/v1/auth/resend-verification');
      const body = JSON.parse(options.body);
      expect(body.email).toBe('jane@example.com');
    });

    it('returns error on invalid email format', async () => {
      const result = await resendVerificationAction('notanemail');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter a valid email address.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns error when the backend rejects (e.g. rate limited)', async () => {
      mockFetchError(429, { message: 'Too many requests. Please wait before resending.' });

      const result = await resendVerificationAction('jane@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many requests');
    });
  });

  // -------------------------------------------
  // googleLoginAction
  // -------------------------------------------
  describe('googleLoginAction', () => {
    it('returns success with user and tokens on valid authorization code', async () => {
      mockFetchSuccess(validAuthResponse());

      const result = await googleLoginAction('valid-auth-code');

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('jane@example.com');
      expect(result.accessToken).toBe('access-token-abc');
    });

    it('sets auth cookies on success', async () => {
      mockFetchSuccess(validAuthResponse());

      await googleLoginAction('valid-auth-code');

      expect(mockCookieSet).toHaveBeenCalledWith(
        'auth-token',
        'access-token-abc',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('calls the gateway /auth/google endpoint with the authorization code', async () => {
      mockFetchSuccess(validAuthResponse());

      await googleLoginAction('valid-auth-code');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/v1/auth/google');
      const body = JSON.parse(options.body);
      expect(body.authorizationCode).toBe('valid-auth-code');
    });

    it('returns error when authorization code is empty', async () => {
      const result = await googleLoginAction('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing Google authorization code.');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns error when the backend rejects the code', async () => {
      mockFetchError(401, { message: 'Invalid Google authorization code.' });

      const result = await googleLoginAction('bad-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid Google authorization code.');
    });
  });

  // -------------------------------------------
  // forgotPasswordAction
  // -------------------------------------------
  describe('forgotPasswordAction', () => {
    it('returns success with a no-leak message on valid email', async () => {
      mockFetchSuccess({});

      const result = await forgotPasswordAction({ success: false }, formData({
        email: 'jane@example.com',
      }));

      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account exists');
    });

    it('calls the gateway /auth/forgot-password endpoint', async () => {
      mockFetchSuccess({});

      await forgotPasswordAction({ success: false }, formData({
        email: 'jane@example.com',
      }));

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/v1/auth/forgot-password');
      const body = JSON.parse(options.body);
      expect(body.email).toBe('jane@example.com');
    });

    it('returns field errors on invalid email', async () => {
      const result = await forgotPasswordAction({ success: false }, formData({
        email: 'notanemail',
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.email).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns field errors on empty email', async () => {
      const result = await forgotPasswordAction({ success: false }, formData({
        email: '',
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.email).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // resetPasswordAction
  // -------------------------------------------
  describe('resetPasswordAction', () => {
    it('returns success on valid token and strong password', async () => {
      mockFetchSuccess({});

      const result = await resetPasswordAction({ success: false }, formData({
        token: 'valid-reset-token',
        newPassword: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(true);
    });

    it('calls the gateway /auth/reset-password endpoint', async () => {
      mockFetchSuccess({});

      await resetPasswordAction({ success: false }, formData({
        token: 'valid-reset-token',
        newPassword: STRONG_PASSWORD,
      }));

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/v1/auth/reset-password');
      const body = JSON.parse(options.body);
      expect(body.token).toBe('valid-reset-token');
      expect(body.newPassword).toBe(STRONG_PASSWORD);
    });

    it('returns field errors when token is empty', async () => {
      const result = await resetPasswordAction({ success: false }, formData({
        token: '',
        newPassword: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.token).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns field errors when password is weak', async () => {
      const result = await resetPasswordAction({ success: false }, formData({
        token: 'valid-reset-token',
        newPassword: 'weakpassword',
      }));

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.newPassword).toBeDefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns error on invalid or expired token', async () => {
      mockFetchError(401, { message: 'invalid or expired reset token' });

      const result = await resetPasswordAction({ success: false }, formData({
        token: 'bad-token',
        newPassword: STRONG_PASSWORD,
      }));

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid or expired reset token');
    });
  });

  // -------------------------------------------
  // logoutAction
  // -------------------------------------------
  describe('logoutAction', () => {
    it('calls serverPost to revoke the token when authenticated', async () => {
      cookieStore.set('auth-token', 'access-token');
      cookieStore.set('refresh-token', 'refresh-token');
      mockServerPost.mockResolvedValueOnce(undefined);

      await logoutAction();

      expect(mockServerPost).toHaveBeenCalledTimes(1);
      const [url, body] = mockServerPost.mock.calls[0];
      expect(url).toBe('/auth/logout');
      expect(body).toEqual({ refreshToken: 'refresh-token' });
    });

    it('clears auth cookies on logout', async () => {
      cookieStore.set('auth-token', 'access-token');
      cookieStore.set('refresh-token', 'refresh-token');
      mockServerPost.mockResolvedValueOnce(undefined);

      await logoutAction();

      expect(mockCookieDelete).toHaveBeenCalledWith('auth-token');
      expect(mockCookieDelete).toHaveBeenCalledWith('refresh-token');
    });

    it('redirects to /login after logout', async () => {
      cookieStore.set('auth-token', 'access-token');
      mockServerPost.mockResolvedValueOnce(undefined);

      await logoutAction();

      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('does NOT call serverPost when there is no auth token', async () => {
      // No cookies set — user is already logged out
      await logoutAction();

      expect(mockServerPost).not.toHaveBeenCalled();
    });

    it('still clears cookies and redirects even if serverPost fails', async () => {
      cookieStore.set('auth-token', 'access-token');
      cookieStore.set('refresh-token', 'refresh-token');
      mockServerPost.mockRejectedValueOnce(new Error('Network error'));

      await logoutAction();

      expect(mockCookieDelete).toHaveBeenCalledWith('auth-token');
      expect(mockCookieDelete).toHaveBeenCalledWith('refresh-token');
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('sends refreshToken in the body when present (defense-in-depth)', async () => {
      cookieStore.set('auth-token', 'access-token');
      cookieStore.set('refresh-token', 'my-refresh-token');
      mockServerPost.mockResolvedValueOnce(undefined);

      await logoutAction();

      expect(mockServerPost.mock.calls[0][1]).toEqual({ refreshToken: 'my-refresh-token' });
    });

    it('sends undefined body when no refresh token is present', async () => {
      cookieStore.set('auth-token', 'access-token');
      // No refresh-token cookie
      mockServerPost.mockResolvedValueOnce(undefined);

      await logoutAction();

      expect(mockServerPost.mock.calls[0][1]).toBeUndefined();
    });
  });
});
