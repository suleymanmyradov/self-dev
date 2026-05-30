import api from './axios-client';
import { getAccessToken } from '@/lib/auth-tokens';
import { setAuthTokens, clearTokens } from '@/lib/auth-tokens';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  AuthResponseSchema,
  ProfileResponseSchema,
  UpdateProfileRequestSchema,
} from '@/lib/validation';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
  ProfileResponse,
} from './types';

const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE_ME: '/profile/me',
  PROFILE: '/profile',
};

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const validated = LoginRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.LOGIN, validated);
  const parsed = AuthResponseSchema.parse(response);

  // Store tokens on successful login
  if (parsed.accessToken && parsed.refreshToken) {
    setAuthTokens(parsed.accessToken, parsed.refreshToken);
  }

  return parsed;
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const validated = RegisterRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.REGISTER, validated);
  const parsed = AuthResponseSchema.parse(response);

  // Store tokens on successful registration
  if (parsed.accessToken && parsed.refreshToken) {
    setAuthTokens(parsed.accessToken, parsed.refreshToken);
  }

  return parsed;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  try {
    await api.post(ENDPOINTS.LOGOUT);
  } finally {
    clearTokens();
  }
}

/**
 * Refresh the access token
 */
export async function refreshToken(token: string): Promise<AuthResponse> {
  const response = await api.post<unknown>(ENDPOINTS.REFRESH, { refreshToken: token });
  const parsed = AuthResponseSchema.parse(response);

  // Store new tokens
  if (parsed.accessToken && parsed.refreshToken) {
    setAuthTokens(parsed.accessToken, parsed.refreshToken);
  }

  return parsed;
}

/**
 * Get current user profile (also verifies token validity)
 */
export async function getCurrentUser(): Promise<ProfileResponse> {
  const response = await api.get<unknown>(ENDPOINTS.PROFILE_ME);
  return ProfileResponseSchema.parse(response);
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
  const validated = UpdateProfileRequestSchema.parse(data);
  const response = await api.put<unknown>(ENDPOINTS.PROFILE, validated);
  return ProfileResponseSchema.parse(response);
}

/**
 * Check if user is authenticated (has a token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!getAccessToken();
}
