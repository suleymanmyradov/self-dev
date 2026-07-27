'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  ResendVerificationRequestSchema,
} from '@/lib/validation';
import { login, register, verifyEmail, resendVerification, googleLogin, forgotPassword, resetPassword } from '@/api/auth';
import { serverPost } from '@/lib/server-api';
import type { LoginRequest, RegisterRequest, Profile } from '@/api/types';

const AUTH_COOKIE_NAME = 'auth-token';
const REFRESH_COOKIE_NAME = 'refresh-token';

async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  cookieStore.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export interface AuthActionState {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  user?: Profile;
  accessToken?: string;
  refreshToken?: string;
  // Registration flow: no tokens are issued until the email is verified.
  requiresVerification?: boolean;
  message?: string;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const raw: LoginRequest = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validated = LoginRequestSchema.safeParse(raw);
    if (!validated.success) {
      const fieldErrors: Record<string, string[]> = {};
      validated.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });
      return { success: false, fieldErrors };
    }

    const response = await login(validated.data);

    // Set HttpOnly cookies
    await setAuthCookies(response.accessToken, response.refreshToken);

    return {
      success: true,
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Login failed. Please try again.';
    return { success: false, error: message };
  }
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const raw: RegisterRequest = {
      fullName: formData.get('fullName') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validated = RegisterRequestSchema.safeParse(raw);
    if (!validated.success) {
      const fieldErrors: Record<string, string[]> = {};
      validated.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });
      return { success: false, fieldErrors };
    }

    // With email verification enabled, register does NOT return tokens. The
    // backend sends a verification email; the user must verify before logging in.
    const response = await register(validated.data);

    return {
      success: true,
      requiresVerification: response.requiresVerification,
      message: response.message,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Registration failed. Please try again.';
    return { success: false, error: message };
  }
}

/**
 * Verify an email using the token from the verification link. On success the
 * backend issues a fresh token pair, so the user is logged in immediately.
 */
export async function verifyEmailAction(token: string): Promise<AuthActionState> {
  try {
    if (!token) {
      return { success: false, error: 'Verification token is required.' };
    }

    const response = await verifyEmail({ token });
    await setAuthCookies(response.accessToken, response.refreshToken);

    return {
      success: true,
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Email verification failed.';
    return { success: false, error: message };
  }
}

export interface ResendVerificationActionState {
  success: boolean;
  error?: string;
  message?: string;
}

export async function resendVerificationAction(
  email: string
): Promise<ResendVerificationActionState> {
  try {
    const validated = ResendVerificationRequestSchema.safeParse({ email });
    if (!validated.success) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    await resendVerification(validated.data);
    return {
      success: true,
      message: 'If the email is registered and unverified, a new verification link has been sent.',
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to resend verification email.';
    return { success: false, error: message };
  }
}

/**
 * Complete Google sign-in by exchanging the OAuth authorization code (returned
 * by Google to the callback page) for app tokens. Sets httpOnly cookies on
 * success.
 */
export async function googleLoginAction(authorizationCode: string): Promise<AuthActionState> {
  try {
    if (!authorizationCode) {
      return { success: false, error: 'Missing Google authorization code.' };
    }

    const response = await googleLogin({ authorizationCode });
    await setAuthCookies(response.accessToken, response.refreshToken);

    return {
      success: true,
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Google sign-in failed. Please try again.';
    return { success: false, error: message };
  }
}

export interface ForgotPasswordActionState {
  success: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData
): Promise<ForgotPasswordActionState> {
  try {
    const raw = { email: formData.get('email') as string };

    const validated = ForgotPasswordRequestSchema.safeParse(raw);
    if (!validated.success) {
      const fieldErrors: Record<string, string[]> = {};
      validated.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });
      return { success: false, fieldErrors };
    }

    await forgotPassword(validated.data);
    // Always report success to avoid leaking which emails are registered.
    return {
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to request password reset.';
    return { success: false, error: message };
  }
}

export interface ResetPasswordActionState {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> {
  try {
    const raw = {
      token: formData.get('token') as string,
      newPassword: formData.get('newPassword') as string,
    };

    const validated = ResetPasswordRequestSchema.safeParse(raw);
    if (!validated.success) {
      const fieldErrors: Record<string, string[]> = {};
      validated.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });
      return { success: false, fieldErrors };
    }

    await resetPassword(validated.data);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to reset password.';
    return { success: false, error: message };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    if (token) {
      // Revoke server-side; serverPost attaches the cookie token as a Bearer header.
      // The refresh token is sent in the body for defense-in-depth revocation.
      // Session-level revocation happens regardless via the access token's session ID.
      await serverPost('/auth/logout', refreshToken ? { refreshToken } : undefined);
    }
  } catch {
    // API call may fail if token is already expired — that's fine
  } finally {
    await clearAuthCookies();
    redirect('/login');
  }
}
