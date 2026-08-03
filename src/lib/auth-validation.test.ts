import { describe, it, expect } from 'vitest';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,
  VerifyEmailRequestSchema,
  ResendVerificationRequestSchema,
  ForgotPasswordRequestSchema,
  GoogleLoginRequestSchema,
  AuthResponseSchema,
  RegisterResponseSchema,
  ProfileSchema,
} from '@/lib/validation';

// ============================================
// Helpers
// ============================================

/** A password that satisfies all strength rules. */
const STRONG_PASSWORD = 'Abcdef1!';

/** A minimal valid profile object for AuthResponse tests. */
function validProfile() {
  return {
    id: 'usr_123',
    fullName: 'Jane Doe',
    username: 'janedoe',
    email: 'jane@example.com',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    emailVerified: true,
  };
}

/** Collect the first error message for a given field from a failed safeParse. */
function firstFieldError(
  result: { success: false; error: { errors: { path: (string | number)[]; message: string }[] } },
  field: string,
): string | undefined {
  return result.error.errors.find((e) => e.path[0] === field)?.message;
}

// ============================================
// LoginRequestSchema
// ============================================

describe('LoginRequestSchema', () => {
  describe('valid input', () => {
    it('accepts a valid email and password (>= 8 chars)', () => {
      const result = LoginRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('accepts an email with a subdomain', () => {
      const result = LoginRequestSchema.safeParse({
        email: 'a@sub.domain.co',
        password: 'password',
      });
      expect(result.success).toBe(true);
    });

    it('trims are NOT applied by schema — caller trims (useLoginForm trims email)', () => {
      // The schema itself does not trim; the form hook trims before parsing.
      // A leading space in email makes it invalid per .email().
      const result = LoginRequestSchema.safeParse({
        email: ' user@example.com',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('email validation', () => {
    it('rejects an empty email with "Email is required"', () => {
      const result = LoginRequestSchema.safeParse({ email: '', password: 'password' });
      expect(result.success).toBe(false);
      if (!result.success) {
        // min(1) fires before .email() for empty string
        const msg = firstFieldError(result, 'email');
        expect(msg).toBeDefined();
      }
    });

    it('rejects a non-email string with "Invalid email address"', () => {
      const result = LoginRequestSchema.safeParse({ email: 'notanemail', password: 'password' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'email')).toBe('Invalid email address');
      }
    });

    it('rejects an email missing the domain', () => {
      const result = LoginRequestSchema.safeParse({ email: 'user@', password: 'password' });
      expect(result.success).toBe(false);
    });

    it('rejects an email missing the local part', () => {
      const result = LoginRequestSchema.safeParse({ email: '@example.com', password: 'password' });
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('rejects a password shorter than 8 characters', () => {
      const result = LoginRequestSchema.safeParse({ email: 'user@example.com', password: 'short' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password must be at least 8 characters');
      }
    });

    it('rejects an empty password', () => {
      const result = LoginRequestSchema.safeParse({ email: 'user@example.com', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password must be at least 8 characters');
      }
    });

    it('accepts a password of exactly 8 characters', () => {
      const result = LoginRequestSchema.safeParse({ email: 'user@example.com', password: '12345678' });
      expect(result.success).toBe(true);
    });

    it('does NOT enforce password strength (no uppercase/special required) — login allows any valid password', () => {
      // LoginRequestSchema only checks min length, unlike RegisterRequestSchema.
      const result = LoginRequestSchema.safeParse({ email: 'user@example.com', password: 'alllowercase' });
      expect(result.success).toBe(true);
    });
  });

  describe('missing fields', () => {
    it('rejects when email is missing', () => {
      const result = LoginRequestSchema.safeParse({ password: 'password' });
      expect(result.success).toBe(false);
    });

    it('rejects when password is missing', () => {
      const result = LoginRequestSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// RegisterRequestSchema
// ============================================

describe('RegisterRequestSchema', () => {
  function validRegister() {
    return {
      fullName: 'Jane Doe',
      username: 'janedoe',
      email: 'jane@example.com',
      password: STRONG_PASSWORD,
    };
  }

  describe('valid input', () => {
    it('accepts a fully valid registration', () => {
      const result = RegisterRequestSchema.safeParse(validRegister());
      expect(result.success).toBe(true);
    });

    it('accepts a username with underscores and hyphens', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'jane_doe-test' });
      expect(result.success).toBe(true);
    });

    it('accepts a username with trailing digits', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'jane123' });
      expect(result.success).toBe(true);
    });

    it('accepts a password of exactly 8 chars with all character classes', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: 'Ab1234!x' });
      expect(result.success).toBe(true);
    });
  });

  describe('fullName validation', () => {
    it('rejects an empty fullName with "Full name is required"', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), fullName: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'fullName')).toBe('Full name is required');
      }
    });

    it('rejects a fullName longer than 100 characters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), fullName: 'A'.repeat(101) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'fullName')).toBe('Name too long');
      }
    });

    it('accepts a fullName of exactly 100 characters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), fullName: 'A'.repeat(100) });
      expect(result.success).toBe(true);
    });
  });

  describe('username validation', () => {
    it('rejects a username shorter than 3 characters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'ab' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'username')).toBe('Username must be at least 3 characters');
      }
    });

    it('rejects a username longer than 30 characters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'a'.repeat(31) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'username')).toBe('Username too long');
      }
    });

    it('accepts a username of exactly 30 characters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'a'.repeat(30) });
      expect(result.success).toBe(true);
    });

    it('rejects a username starting with a digit', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: '1jane' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'username')).toContain('lowercase');
      }
    });

    it('rejects a username starting with an underscore', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: '_jane' });
      expect(result.success).toBe(false);
    });

    it('rejects a username with uppercase letters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'JaneDoe' });
      expect(result.success).toBe(false);
    });

    it('rejects a username with special chars other than _ and -', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'jane.doe' });
      expect(result.success).toBe(false);
    });

    it('rejects a username with spaces', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), username: 'jane doe' });
      expect(result.success).toBe(false);
    });
  });

  describe('email validation', () => {
    it('rejects an invalid email', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), email: 'notanemail' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'email')).toBe('Invalid email address');
      }
    });

    it('rejects an empty email', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), email: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('password strength validation', () => {
    it('rejects a password shorter than 8 characters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: 'Ab1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password must be at least 8 characters');
      }
    });

    it('rejects a password longer than 128 characters', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: 'A1!' + 'a'.repeat(126) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password too long');
      }
    });

    it('rejects a password without an uppercase letter', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: 'abcdef1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password must contain at least one uppercase letter');
      }
    });

    it('rejects a password without a lowercase letter', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: 'ABCDEF1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password must contain at least one lowercase letter');
      }
    });

    it('rejects a password without a number', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: 'Abcdefg!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password must contain at least one number');
      }
    });

    it('rejects a password without a special character', () => {
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: 'Abcdef12' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'password')).toBe('Password must contain at least one special character');
      }
    });

    it('accepts a password of exactly 128 chars with all character classes', () => {
      const pwd = 'A1!' + 'a'.repeat(125);
      expect(pwd.length).toBe(128);
      const result = RegisterRequestSchema.safeParse({ ...validRegister(), password: pwd });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================
// ResetPasswordRequestSchema
// ============================================

describe('ResetPasswordRequestSchema', () => {
  function validReset() {
    return { token: 'abc123', newPassword: STRONG_PASSWORD };
  }

  describe('valid input', () => {
    it('accepts a valid token and strong password', () => {
      const result = ResetPasswordRequestSchema.safeParse(validReset());
      expect(result.success).toBe(true);
    });
  });

  describe('token validation', () => {
    it('rejects an empty token with "Token is required"', () => {
      const result = ResetPasswordRequestSchema.safeParse({ ...validReset(), token: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'token')).toBe('Token is required');
      }
    });

    it('rejects a missing token', () => {
      const result = ResetPasswordRequestSchema.safeParse({ newPassword: STRONG_PASSWORD });
      expect(result.success).toBe(false);
    });
  });

  describe('newPassword strength validation', () => {
    it('rejects a password shorter than 8 characters', () => {
      const result = ResetPasswordRequestSchema.safeParse({ ...validReset(), newPassword: 'Ab1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'newPassword')).toBe('Password must be at least 8 characters');
      }
    });

    it('rejects a password longer than 128 characters', () => {
      const result = ResetPasswordRequestSchema.safeParse({ ...validReset(), newPassword: 'A1!' + 'a'.repeat(126) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'newPassword')).toBe('Password too long');
      }
    });

    it('rejects a password without an uppercase letter', () => {
      const result = ResetPasswordRequestSchema.safeParse({ ...validReset(), newPassword: 'abcdef1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'newPassword')).toBe('Password must contain at least one uppercase letter');
      }
    });

    it('rejects a password without a lowercase letter', () => {
      const result = ResetPasswordRequestSchema.safeParse({ ...validReset(), newPassword: 'ABCDEF1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'newPassword')).toBe('Password must contain at least one lowercase letter');
      }
    });

    it('rejects a password without a number', () => {
      const result = ResetPasswordRequestSchema.safeParse({ ...validReset(), newPassword: 'Abcdefg!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'newPassword')).toBe('Password must contain at least one number');
      }
    });

    it('rejects a password without a special character', () => {
      const result = ResetPasswordRequestSchema.safeParse({ ...validReset(), newPassword: 'Abcdef12' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(firstFieldError(result, 'newPassword')).toBe('Password must contain at least one special character');
      }
    });
  });
});

// ============================================
// VerifyEmailRequestSchema
// ============================================

describe('VerifyEmailRequestSchema', () => {
  it('accepts a non-empty token', () => {
    const result = VerifyEmailRequestSchema.safeParse({ token: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty token with "Token is required"', () => {
    const result = VerifyEmailRequestSchema.safeParse({ token: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstFieldError(result, 'token')).toBe('Token is required');
    }
  });

  it('rejects a missing token', () => {
    const result = VerifyEmailRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ============================================
// ResendVerificationRequestSchema
// ============================================

describe('ResendVerificationRequestSchema', () => {
  it('accepts a valid email', () => {
    const result = ResendVerificationRequestSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email with "Invalid email address"', () => {
    const result = ResendVerificationRequestSchema.safeParse({ email: 'notanemail' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstFieldError(result, 'email')).toBe('Invalid email address');
    }
  });

  it('rejects an empty email', () => {
    const result = ResendVerificationRequestSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing email', () => {
    const result = ResendVerificationRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ============================================
// ForgotPasswordRequestSchema
// ============================================

describe('ForgotPasswordRequestSchema', () => {
  it('accepts a valid email', () => {
    const result = ForgotPasswordRequestSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email with "Invalid email address"', () => {
    const result = ForgotPasswordRequestSchema.safeParse({ email: 'notanemail' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstFieldError(result, 'email')).toBe('Invalid email address');
    }
  });

  it('rejects an empty email', () => {
    const result = ForgotPasswordRequestSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing email', () => {
    const result = ForgotPasswordRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ============================================
// GoogleLoginRequestSchema
// ============================================

describe('GoogleLoginRequestSchema', () => {
  it('accepts a non-empty authorization code', () => {
    const result = GoogleLoginRequestSchema.safeParse({ authorizationCode: 'code123' });
    expect(result.success).toBe(true);
  });

  it('accepts an optional redirectUri when it is a valid URL', () => {
    const result = GoogleLoginRequestSchema.safeParse({
      authorizationCode: 'code123',
      redirectUri: 'http://localhost:3000/auth/callback/google',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty authorization code with "Authorization code is required"', () => {
    const result = GoogleLoginRequestSchema.safeParse({ authorizationCode: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstFieldError(result, 'authorizationCode')).toBe('Authorization code is required');
    }
  });

  it('rejects a missing authorization code', () => {
    const result = GoogleLoginRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects an invalid redirectUri', () => {
    const result = GoogleLoginRequestSchema.safeParse({
      authorizationCode: 'code123',
      redirectUri: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================
// ProfileSchema
// ============================================

describe('ProfileSchema', () => {
  it('accepts a complete profile', () => {
    const result = ProfileSchema.safeParse(validProfile());
    expect(result.success).toBe(true);
  });

  it('accepts a profile with optional fields', () => {
    const result = ProfileSchema.safeParse({
      ...validProfile(),
      bio: 'Developer',
      location: 'Earth',
      website: 'https://example.com',
      avatarUrl: 'https://cdn.example.com/avatar.png',
      interests: ['reading', 'coding'],
    });
    expect(result.success).toBe(true);
  });

  it('transforms null interests to an empty array', () => {
    const result = ProfileSchema.safeParse({ ...validProfile(), interests: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interests).toEqual([]);
    }
  });

  it('defaults missing interests to an empty array', () => {
    const result = ProfileSchema.safeParse(validProfile());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interests).toEqual([]);
    }
  });

  it('requires emailVerified to be a boolean', () => {
    const result = ProfileSchema.safeParse({ ...validProfile(), emailVerified: 'true' });
    expect(result.success).toBe(false);
  });

  it('accepts emailVerified: false (unverified user)', () => {
    const result = ProfileSchema.safeParse({ ...validProfile(), emailVerified: false });
    expect(result.success).toBe(true);
  });

  it('requires id', () => {
    const { id, ...rest } = validProfile();
    void id;
    const result = ProfileSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('requires createdAt and updatedAt', () => {
    const { createdAt, updatedAt, ...rest } = validProfile();
    void createdAt;
    void updatedAt;
    const result = ProfileSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ============================================
// AuthResponseSchema
// ============================================

describe('AuthResponseSchema', () => {
  function validAuthResponse() {
    return {
      accessToken: 'access-token-string',
      refreshToken: 'refresh-token-string',
      expiresIn: 900,
      user: validProfile(),
    };
  }

  it('accepts a valid auth response', () => {
    const result = AuthResponseSchema.safeParse(validAuthResponse());
    expect(result.success).toBe(true);
  });

  it('requires accessToken', () => {
    const { accessToken, ...rest } = validAuthResponse();
    void accessToken;
    const result = AuthResponseSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('requires refreshToken', () => {
    const { refreshToken, ...rest } = validAuthResponse();
    void refreshToken;
    const result = AuthResponseSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('requires expiresIn to be a positive integer', () => {
    const result = AuthResponseSchema.safeParse({ ...validAuthResponse(), expiresIn: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects expiresIn of 0', () => {
    const result = AuthResponseSchema.safeParse({ ...validAuthResponse(), expiresIn: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer expiresIn', () => {
    const result = AuthResponseSchema.safeParse({ ...validAuthResponse(), expiresIn: 1.5 });
    expect(result.success).toBe(false);
  });

  it('requires a valid user (ProfileSchema)', () => {
    const result = AuthResponseSchema.safeParse({ ...validAuthResponse(), user: { id: '1' } });
    expect(result.success).toBe(false);
  });

  it('accepts a response with an unverified user (after verify-email the user is verified, but schema allows false)', () => {
    const result = AuthResponseSchema.safeParse({
      ...validAuthResponse(),
      user: { ...validProfile(), emailVerified: false },
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// RegisterResponseSchema
// ============================================

describe('RegisterResponseSchema', () => {
  it('accepts a response with requiresVerification: true and a message', () => {
    const result = RegisterResponseSchema.safeParse({
      requiresVerification: true,
      message: 'Check your email to verify your account.',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a response with requiresVerification: false', () => {
    const result = RegisterResponseSchema.safeParse({
      requiresVerification: false,
      message: 'Account created.',
    });
    expect(result.success).toBe(true);
  });

  it('requires requiresVerification to be a boolean', () => {
    const result = RegisterResponseSchema.safeParse({
      requiresVerification: 'true',
      message: 'msg',
    });
    expect(result.success).toBe(false);
  });

  it('requires a message string', () => {
    const result = RegisterResponseSchema.safeParse({ requiresVerification: true });
    expect(result.success).toBe(false);
  });

  it('requires message to be a string', () => {
    const result = RegisterResponseSchema.safeParse({ requiresVerification: true, message: 123 });
    expect(result.success).toBe(false);
  });
});
