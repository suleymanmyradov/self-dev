import { useEffect, useState } from 'react';

/**
 * Returns true after the component has mounted on the client.
 * Use this to guard UI that depends on client-only state (localStorage, Zustand persist, etc.)
 * to prevent hydration mismatches in Next.js App Router.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
