import 'server-only';

import { ApiError } from '@/api/axios-client';

/**
 * Swallow 404s by returning `fallback` — useful for endpoints where a 404
 * means "no data yet" (e.g. current weekly review, unset coaching profile).
 *
 * All other errors (401, 500, network errors) re-throw so the route's
 * `error.tsx` boundary renders a retry UI instead of a silent empty page.
 */
export async function swallowNotFound<T>(
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return fallback;
    throw error;
  }
}

/**
 * Swallow ALL errors by returning `fallback`.
 *
 * Use only for non-critical, optional data where the UI has its own fallback
 * (e.g. category lists that default to a hardcoded set). Critical data should
 * use {@link swallowNotFound} or be left to throw.
 */
export async function swallowOptional<T>(
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[swallowOptional] Swallowed error:', error);
    }
    return fallback;
  }
}
