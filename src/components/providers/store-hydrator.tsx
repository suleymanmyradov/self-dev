'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/uiStore';
import { useOnboardingStore } from '@/store/onboarding';
import { getCurrentUser } from '@/api/auth';

/**
 * Triggers Zustand persist rehydration once after React hydration completes,
 * then bootstraps the current user from the httpOnly session cookie.
 *
 * Tokens never reach the browser — we call the BFF-proxied `/profile/me` which
 * authenticates via the cookie and tells us who (if anyone) is logged in. This
 * is the reactive `isAuthenticated` signal React Query hooks gate on.
 */
export function StoreHydrator() {
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
      })
      .catch(() => {
        // No valid session — the axios 401 handler already cleared auth state;
        // the middleware will redirect to /login on the next protected navigation.
        useAuthStore.getState().logout();
      });
  }, []);

  return null;
}
