'use client';

import { useAuthStore } from '@/store/auth';

interface HydrationGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Gates client-only UI behind Zustand rehydration.
 * During SSR and the initial hydration render, `fallback` is shown.
 * After the auth store rehydrates from localStorage, `children` is rendered.
 *
 * The fallback MUST be structurally identical between server and client
 * to avoid hydration mismatches. Use static skeletons, not null.
 */
export function HydrationGate({ children, fallback = null }: HydrationGateProps) {
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  return hasHydrated ? children : fallback;
}
