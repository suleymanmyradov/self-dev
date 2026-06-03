'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/uiStore';
import { useOnboardingStore } from '@/store/onboarding';

/**
 * Triggers Zustand persist rehydration once after React hydration completes.
 * Place this once inside your root layout, inside the client boundary.
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
  }, []);

  return null;
}
