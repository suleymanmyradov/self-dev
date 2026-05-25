import api, { setAuthTokens, clearTokens } from './client';
import { getAccessTokenFromStore } from '@/store/auth';
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
  const response = await api.post<AuthResponse>(ENDPOINTS.LOGIN, data);
  
  // Store tokens on successful login
  if (response.accessToken && response.refreshToken) {
    setAuthTokens(response.accessToken, response.refreshToken);
  }
  
  return response;
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(ENDPOINTS.REGISTER, data);
  
  // Store tokens on successful registration
  if (response.accessToken && response.refreshToken) {
    setAuthTokens(response.accessToken, response.refreshToken);
  }
  
  return response;
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
  const response = await api.post<AuthResponse>(ENDPOINTS.REFRESH, { refreshToken: token });
  
  // Store new tokens
  if (response.accessToken && response.refreshToken) {
    setAuthTokens(response.accessToken, response.refreshToken);
  }
  
  return response;
}

/**
 * Get current user profile (also verifies token validity)
 */
export async function getCurrentUser(): Promise<ProfileResponse> {
  return api.get<ProfileResponse>(ENDPOINTS.PROFILE_ME);
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
  return api.put<ProfileResponse>(ENDPOINTS.PROFILE, data);
}

/**
 * Check if user is authenticated (has a token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!getAccessTokenFromStore();
}
