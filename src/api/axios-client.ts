import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ZodSchema } from 'zod';
import { config, isDev } from '@/lib/config';
import { clearAuthState } from '@/store/auth';

// Debug logging in development
const DEBUG = isDev;

// Fields whose values are redacted from debug logs to avoid leaking secrets.
const REDACTED_KEYS = new Set(['password', 'newPassword', 'token', 'authorizationCode', 'refreshToken']);

function redactBody(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const obj = data as Record<string, unknown>;
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    redacted[key] = REDACTED_KEYS.has(key) ? '[REDACTED]' : value;
  }
  return redacted;
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
  if (baseUrl.startsWith('/')) {
    if (typeof window !== 'undefined') {
      baseUrl = `${window.location.origin}${baseUrl}`;
    } else {
      baseUrl = `${config.apiProxyUrl}${baseUrl}`;
    }
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

// Request interceptor: the access token lives in an httpOnly cookie attached by
// the same-origin BFF proxy, so the browser never sends an Authorization header.
axiosInstance.interceptors.request.use(
  (configObj: InternalAxiosRequestConfig) => {
    if (DEBUG) {
      console.log(`[API] ${configObj.method?.toUpperCase()} ${configObj.url}`, {
        params: configObj.params,
        data: redactBody(configObj.data),
      });
    }
    return configObj;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: the BFF already attempted a transparent refresh, so a 401
// reaching the browser means the session is genuinely dead — clear local auth state.
axiosInstance.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(`[API] Response ${response.status} ${response.statusText}`, {
        url: response.config.url,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAuthState();
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
