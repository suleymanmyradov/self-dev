export { useAuth, useAccessToken } from '@/store/auth';
export type { AuthState } from '@/store/auth';
export { useHydrated } from './use-hydrated';

import { useAuth as useAuthBase } from '@/store/auth';
import { useHydrated } from './use-hydrated';

/**
 * Hydration-safe auth hook.
 * Returns auth state only after the client has hydrated.
 * Use this when rendering UI that depends on persisted auth state
 * to avoid Next.js hydration mismatches.
 */
export function useAuthSafe() {
  const hydrated = useHydrated();
  const auth = useAuthBase();
  return {
    ...auth,
    isReady: hydrated && auth.hasHydrated,
  };
}
