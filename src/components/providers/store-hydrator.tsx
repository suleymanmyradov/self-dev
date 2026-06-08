'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/uiStore';
import { useOnboardingStore } from '@/store/onboarding';
import { getCurrentUser } from '@/api/auth';
import { getBillingOverview } from '@/api/billing';

/**
 * Triggers Zustand persist rehydration once after React hydration completes,
 * then bootstraps the current user from the httpOnly session cookie.
 *
 * Tokens never reach the browser — we call the BFF-proxied `/profile/me` which
 * authenticates via the cookie and tells us who (if anyone) is logged in. This
 * is the reactive `isAuthenticated` signal React Query hooks gate on.
 */
export function StoreHydrator() {
  const queryClient = useQueryClient();

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
  }, [queryClient]);

  return null;
}
