import { useSyncExternalStore } from 'react';

function getServerSnapshot() {
  return false;
}

function getSnapshot() {
  return true;
}

function subscribe() {
  return () => {};
}

/**
 * Returns true after the component has mounted on the client.
 * Use this to guard UI that depends on client-only state (localStorage, Zustand persist, etc.)
 * to prevent hydration mismatches in Next.js App Router.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
