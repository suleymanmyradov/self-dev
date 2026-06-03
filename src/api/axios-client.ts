import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ZodSchema } from 'zod';
import { config, isDev } from '@/lib/config';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearTokens,
} from '@/lib/auth-tokens';

// Debug logging in development
const DEBUG = isDev;

// Track if we're currently refreshing the token
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
// Attempt to refresh the access token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${config.apiUrl}/auth/refresh`,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    if (accessToken && newRefreshToken) {
      setAuthTokens(accessToken, newRefreshToken);
      return true;
    }
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// Ensure only one refresh request at a time
async function ensureValidToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request options type
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

function buildBaseUrl(): string {
  let baseUrl = config.apiUrl;
  if (baseUrl.startsWith('/') && typeof window !== 'undefined') {
    baseUrl = `${window.location.origin}${baseUrl}`;
  }
  return baseUrl;
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: buildBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
axiosInstance.interceptors.request.use(
  (configObj: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken && configObj.headers) {
      configObj.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (DEBUG) {
      console.log(`[API] ${configObj.method?.toUpperCase()} ${configObj.url}`, {
        params: configObj.params,
        data: configObj.data,
      });
    }

    return configObj;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 + token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(`[API] Response ${response.status} ${response.statusText}`, {
        url: response.config.url,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 - try to refresh token and retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      const endpoint = originalRequest.url || '';
      if (endpoint.includes('/auth/refresh')) {
        clearTokens();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshed = await ensureValidToken();
      if (refreshed) {
        const newToken = getAccessToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosInstance(originalRequest);
      }

      // If refresh failed, clear tokens
      clearTokens();
    }

    return Promise.reject(error);
  }
);

// Base request function with optional Zod validation
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  schema?: ZodSchema<T>
): Promise<T> {
  const { method = 'GET', headers = {}, body, params, timeout = 15000 } = options;

  const axiosConfig: AxiosRequestConfig = {
    method,
    url: endpoint,
    headers,
    params,
    data: body,
    timeout,
  };

  try {
    const response = await axiosInstance(axiosConfig);
    const data = response.data;
    if (schema) {
      return schema.parse(data);
    }
    return data as T;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 0;
      const statusText = error.response?.statusText ?? 'Network Error';
      let message = error.message;
      let errorData: unknown;

      if (error.response?.data) {
        errorData = error.response.data;
        const data = errorData as { message?: string; error?: string };
        message = data.message || data.error || message;
      }

      if (isDev) {
        console.error(`[API] Error ${status}:`, message, errorData);
      }

      throw new ApiError(status, statusText, message, errorData);
    }

    throw error;
  }
}

// Convenience methods
export const api = {
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, timeout?: number): Promise<T> {
    return request<T>(endpoint, { method: 'GET', params, timeout });
  },

  post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>, timeout?: number): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body, params, timeout });
  },

  put<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>, timeout?: number): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body, params, timeout });
  },

  patch<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>, timeout?: number): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body, params, timeout });
  },

  delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, timeout?: number): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE', params, timeout });
  },
};

export default api;
