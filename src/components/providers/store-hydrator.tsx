'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/uiStore';
import { useOnboardingStore } from '@/store/onboarding';
import { getCurrentUser } from '@/api/auth';
import { getBillingOverview } from '@/api/billing';

/**
 * Routes that are in the middle of an auth flow. StoreHydrator must NOT fire
 * getCurrentUser() on these — the session cookies may not exist yet (e.g. the
 * Google callback page calls a server action that sets them asynchronously).
 * Firing /profile/me here races with the login, producing a spurious 401 that
 * clears the in-memory auth store and can confuse downstream components.
 */
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/auth',
  '/verify-email',
  '/check-email',
  '/forgot-password',
  '/reset-password',
];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/**
 * Triggers Zustand persist rehydration once after React hydration completes,
 * then bootstraps the current user from the httpOnly session cookie.
 *
 * Tokens never reach the browser — we call the BFF-proxied `/profile/me` which
 * authenticates via the cookie and tells us who (if anyone) is logged in. This
 * is the reactive `isAuthenticated` signal React Query hooks gate on.
 *
 * The bootstrap is skipped on auth-flow routes (where cookies may not exist yet)
 * and retried once when the user navigates to a non-auth route. After a
 * successful or failed attempt on a non-auth route, it is not retried on
 * subsequent navigations — the proxy middleware handles session validation.
 */
export function StoreHydrator() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  // Tracks whether we've already attempted the bootstrap on a non-auth route.
  // We retry only when transitioning from an auth route to a non-auth route.
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!useAuthStore.persist.hasHydrated()) {
      useAuthStore.persist.rehydrate();
    }
    if (!useUIStore.persist.hasHydrated()) {
      useUIStore.persist.rehydrate();
    }
    if (!useOnboardingStore.persist.hasHydrated()) {
      useOnboardingStore.persist.rehydrate();
    }

    // Skip the /profile/me bootstrap on auth-flow routes. These pages set
    // session cookies via server actions (e.g. Google OAuth callback) and
    // calling /profile/me before the cookies exist produces a 401 that races
    // with the login. Retry once when the user reaches a non-auth route.
    if (isAuthRoute(pathname)) return;
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    getCurrentUser()
      .then((res) => {
        useAuthStore.getState().setUser(res.data);
        // Warm the billing cache so multiple components (PlanBadge, FeatureLock,
        // page clients) share a single source of truth and avoid duplicate fetches.
        queryClient.prefetchQuery({
          queryKey: ['billing', 'overview'],
          queryFn: () => getBillingOverview(),
          staleTime: 15 * 60 * 1000,
        });
      })
      .catch(() => {
        // No valid session — the axios 401 handler already cleared auth state;
        // the middleware will redirect to /login on the next protected navigation.
        useAuthStore.getState().logout();
      });
  }, [queryClient, pathname]);

  return null;
}
