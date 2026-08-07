import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { backendUrl, config, isAiGatewayPath, isDev } from './config';
import { ApiError } from '@/api/axios-client';

const AUTH_COOKIE_NAME = 'auth-token';

/**
 * Build the base URL for a server-side API call, routing to the ai-gateway
 * or main gateway based on the path prefix. Server components talk to the
 * backend directly (origin + /api/v1), attaching the access token from the
 * httpOnly cookie.
 */
function buildServerBaseUrl(path: string): string {
  // Strip the /api/v1 prefix if present — backendUrl adds it back.
  const stripped = path.replace(/^\/api\/v1/, '');
  const origin = isAiGatewayPath(stripped) ? config.aiGatewayUrl : config.apiProxyUrl;
  return `${origin}${config.apiPrefix}`;
}

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/**
 * Exchange a refresh token for a fresh token pair via the backend gateway.
 * Used as a fallback when the proxy middleware's refresh didn't cover a
 * request (e.g. clock-skew window between proxy and backend token validation).
 *
 * Note: the new cookies cannot be persisted from a Server Component (Next.js
 * only allows cookie writes in Server Actions / Route Handlers). The proxy
 * middleware remains the primary refresh mechanism; this is a last-resort
 * retry to avoid crashing the server render with a 401.
 */
async function tryServerRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_PROXY_URL || 'http://localhost:8080')
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/, '');
  try {
    const res = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as
      | { accessToken?: string; refreshToken?: string }
      | null;
    if (!data?.accessToken || !data?.refreshToken) return null;
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch {
    return null;
  }
}

export async function serverRequest<T>(cfg: AxiosRequestConfig): Promise<T> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const urlPath = cfg.url ?? '';
  const baseUrl = buildServerBaseUrl(urlPath);

  const doRequest = async (token: string | null): Promise<T> => {
    const response = await axios({
      ...cfg,
      url: `${baseUrl}${cfg.url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cfg.headers ?? {}),
      },
      timeout: cfg.timeout || 15000,
    });
    return response.data as T;
  };

  try {
    return await doRequest(accessToken);
  } catch (error) {
    // 401: the proxy middleware should have refreshed already, but a clock-skew
    // window or a token revoked server-side can still cause this. Try one
    // silent refresh; if that also fails, redirect to login instead of
    // throwing (which would crash the streaming render).
    if (error instanceof AxiosError && error.response?.status === 401) {
      const refreshToken = cookieStore.get('refresh-token')?.value;
      if (refreshToken) {
        const refreshed = await tryServerRefresh(refreshToken);
        if (refreshed) {
          accessToken = refreshed.accessToken;
          try {
            return await doRequest(accessToken);
          } catch (retryError) {
            if (isDev) {
              console.error('[Server API] Retry after refresh also failed:', retryError);
            }
            // Refresh succeeded but the retried request still 401'd — session
            // is unrecoverable here. Redirect to login.
            redirect('/login');
          }
        }
      }
      // No refresh token or refresh failed — session is dead.
      if (isDev) {
        console.error('[Server API] 401: no valid refresh token, redirecting to login');
      }
      redirect('/login');
    }

    // Non-401 error — surface as ApiError for error boundaries / callers.
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
        console.error(`[Server API] Error ${status}:`, message, errorData);
      }
      throw new ApiError(status, statusText, message, errorData);
    }
    throw error;
  }
}

export async function serverGet<T>(url: string, params?: Record<string, unknown>, timeout?: number): Promise<T> {
  return serverRequest<T>({ method: 'GET', url, params, timeout });
}

export async function serverPost<T>(url: string, data?: unknown, params?: Record<string, unknown>, timeout?: number): Promise<T> {
  return serverRequest<T>({ method: 'POST', url, data, params, timeout });
}

export async function serverPut<T>(url: string, data?: unknown, params?: Record<string, unknown>, timeout?: number): Promise<T> {
  return serverRequest<T>({ method: 'PUT', url, data, params, timeout });
}

export async function serverPatch<T>(url: string, data?: unknown, params?: Record<string, unknown>, timeout?: number): Promise<T> {
  return serverRequest<T>({ method: 'PATCH', url, data, params, timeout });
}

export async function serverDelete<T>(url: string, params?: Record<string, unknown>, timeout?: number): Promise<T> {
  return serverRequest<T>({ method: 'DELETE', url, params, timeout });
}
