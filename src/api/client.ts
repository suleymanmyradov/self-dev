import { config } from '@/lib/config';
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearTokens,
} from '@/lib/auth-tokens';

// Debug logging in development
const DEBUG = config.appEnv === 'development';

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
    const response = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    if (data.accessToken && data.refreshToken) {
      setAuthTokens(data.accessToken, data.refreshToken);
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
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  let baseUrl = config.apiUrl;
  
  // If apiUrl is relative (starts with /), we need to make it absolute for fetch
  if (baseUrl.startsWith('/') && typeof window !== 'undefined') {
    baseUrl = `${window.location.origin}${baseUrl}`;
  }
  
  const url = `${baseUrl}${endpoint}`;
  if (!params) return url;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

// Base request function
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, params } = options;

  const url = buildUrl(endpoint, params);
  const accessToken = getAccessToken();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchInit: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    fetchInit.body = JSON.stringify(body);
  }

  if (DEBUG) {
    console.log(`[API] ${method} ${url}`, { body, params });
  }

  try {
    const response = await fetch(url, fetchInit);

    if (DEBUG) {
      console.log(`[API] Response ${response.status} ${response.statusText}`, { url });
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = response.statusText;
      let errorData: unknown;

      if (isJson) {
        try {
          errorData = await response.json();
          errorMessage = (errorData as { message?: string; error?: string })?.message 
            || (errorData as { message?: string; error?: string })?.error 
            || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }
      }

      // Handle 401 - try to refresh token and retry
      if (response.status === 401 && endpoint !== '/auth/refresh') {
        const refreshed = await ensureValidToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = getAccessToken();
          if (newToken) {
            requestHeaders['Authorization'] = `Bearer ${newToken}`;
          }
          fetchInit.headers = requestHeaders;
          
          const retryResponse = await fetch(url, fetchInit);
          if (retryResponse.ok) {
            const retryContentType = retryResponse.headers.get('content-type');
            if (retryResponse.status === 204) {
              return {} as T;
            }
            if (retryContentType?.includes('application/json')) {
              return retryResponse.json();
            }
            return {} as T;
          }
        }
        // If refresh failed or retry failed, clear tokens
        clearTokens();
      }

      console.error(`[API] Error ${response.status}:`, errorMessage, errorData);
      throw new ApiError(response.status, response.statusText, errorMessage, errorData);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    if (!isJson) {
      return {} as T;
    }

    const data = await response.json();
    if (DEBUG) {
      console.log(`[API] Response data:`, data);
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`[API] Network error:`, error);
    throw error;
  }
}

// Convenience methods
export const api = {
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'GET', params });
  },

  post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body, params });
  },

  put<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body, params });
  },

  patch<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body, params });
  },

  delete<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE', params });
  },
};

export default api;
