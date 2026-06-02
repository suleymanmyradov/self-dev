'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

/**
 * Triggers Zustand persist rehydration once after React hydration completes.
 * Place this once inside your root layout, inside the client boundary.
 */
export function StoreHydrator() {
  useEffect(() => {
    if (!useAuthStore.persist.hasHydrated()) {
      useAuthStore.persist.rehydrate();
    }
  }, []);

  return null;
}
