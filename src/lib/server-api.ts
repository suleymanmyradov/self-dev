import 'server-only';

import { cookies } from 'next/headers';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { config, isDev } from './config';
import { ApiError } from '@/api/axios-client';

const AUTH_COOKIE_NAME = 'auth-token';

function buildServerBaseUrl(): string {
  const url = config.apiUrl;
  if (url.startsWith('/')) {
    return `${config.appUrl}${url}`;
  }
  return url.replace(/\/$/, '');
}

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function serverRequest<T>(cfg: AxiosRequestConfig): Promise<T> {
  const token = await getServerAccessToken();
  const baseUrl = buildServerBaseUrl();
  try {
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
