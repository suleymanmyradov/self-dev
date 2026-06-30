import api from './axios-client';
import { useAuthStore } from '@/store/auth';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  AuthResponseSchema,
  RegisterResponseSchema,
  ProfileResponseSchema,
  UpdateProfileRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  ResendVerificationRequestSchema,
  VerifyEmailRequestSchema,
} from '@/lib/validation';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  UpdateProfileRequest,
  ProfileResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  VerifyEmailRequest,
  GoogleLoginRequest,
} from './types';

const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  GOOGLE_LOGIN: '/auth/google',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
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
 * Register a new user. With email verification enabled, the backend does NOT
 * return tokens — it sends a verification email. The caller should show the
 * "check your email" state from the returned message.
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const validated = RegisterRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.REGISTER, validated);
  return RegisterResponseSchema.parse(response);
}

/**
 * Verify an email using the token from the verification link. Returns a fresh
 * token pair so the user is logged in immediately after verifying.
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
  const validated = VerifyEmailRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.VERIFY_EMAIL, validated);
  return AuthResponseSchema.parse(response);
}

/**
 * Resend the email verification link. Rate-limited server-side.
 */
export async function resendVerification(data: ResendVerificationRequest): Promise<void> {
  const validated = ResendVerificationRequestSchema.parse(data);
  await api.post<unknown>(ENDPOINTS.RESEND_VERIFICATION, validated);
}

/**
 * Sign in with Google by exchanging the OAuth authorization code for tokens.
 * The code is exchanged server-side (the client secret lives in the auth
 * microservice); the browser only ever sees the public client ID.
 */
export async function googleLogin(data: GoogleLoginRequest): Promise<AuthResponse> {
  const response = await api.post<unknown>(ENDPOINTS.GOOGLE_LOGIN, data);
  return AuthResponseSchema.parse(response);
}

/**
 * Request a password reset email. Always resolves (the backend does not reveal
 * whether the email exists).
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  const validated = ForgotPasswordRequestSchema.parse(data);
  await api.post<unknown>(ENDPOINTS.FORGOT_PASSWORD, validated);
}

/**
 * Reset a password using the token from the reset email.
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  const validated = ResetPasswordRequestSchema.parse(data);
  await api.post<unknown>(ENDPOINTS.RESET_PASSWORD, validated);
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
