import api from './axios-client';
import { useAuthStore } from '@/store/auth';
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
  // Token cookies are set server-side (server action / BFF); the browser never stores them.
  const validated = LoginRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.LOGIN, validated);
  return AuthResponseSchema.parse(response);
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  // Token cookies are set server-side (server action / BFF); the browser never stores them.
  const validated = RegisterRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.REGISTER, validated);
  return AuthResponseSchema.parse(response);
}

/**
 * Logout the current user. The gateway revokes the token and the server clears
 * the httpOnly cookies; here we only drop the in-memory client auth state.
 */
export async function logout(): Promise<void> {
  try {
    await api.post(ENDPOINTS.LOGOUT);
  } finally {
    useAuthStore.getState().logout();
  }
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
 * Check if the user is authenticated, per the in-memory client auth state.
 * (The authoritative check is server-side via the httpOnly session cookie.)
 */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}
