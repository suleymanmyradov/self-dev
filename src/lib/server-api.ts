import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { config, isAiGatewayPath, isDev } from './config';
import { peekRefreshToken } from './refresh-coordinator';
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
 * Reuse a token pair produced by a concurrent cookie-writing refresh, if one
 * is in flight. Server components CANNOT persist cookies (Next.js only allows
 * cookie writes in Server Actions / Route Handlers), so initiating a rotation
 * here would burn the single-use refresh token: the new pair never reaches
 * the browser and the session dies. We only ever piggy-back on an exchange
 * already started by the proxy or the BFF route — both of which persist the
 * rotated cookies.
 */
async function trySharedRefresh(
  refreshToken: string,
): Promise<{ accessToken: string } | null> {
  const outcome = await peekRefreshToken(refreshToken);
  if (!outcome || outcome.kind !== 'ok') return null;
  return { accessToken: outcome.accessToken };
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
    // window or a token revoked server-side can still cause this. Reuse a
    // concurrent rotation's result if one exists (we may never initiate one —
    // we can't persist the cookies); otherwise redirect to login instead of
    // throwing (which would crash the streaming render).
    if (error instanceof AxiosError && error.response?.status === 401) {
      const refreshToken = cookieStore.get('refresh-token')?.value;
      if (refreshToken) {
        const refreshed = await trySharedRefresh(refreshToken);
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
