'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from '@/lib/validation';
import { login, register } from '@/api/auth';
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

    const response = await register(validated.data);

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
      error instanceof Error ? error.message : 'Registration failed. Please try again.';
    return { success: false, error: message };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      // Revoke server-side; serverPost attaches the cookie token as a Bearer header.
      await serverPost('/auth/logout');
    }
  } catch {
    // API call may fail if token is already expired — that's fine
  } finally {
    await clearAuthCookies();
    redirect('/login');
  }
}
