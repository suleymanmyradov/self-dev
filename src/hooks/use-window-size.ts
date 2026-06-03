import { useSyncExternalStore } from 'react'

export interface WindowSize {
  width: number
  height: number
}

function getSnapshot(): WindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function getServerSnapshot(): WindowSize {
  return { width: 0, height: 0 }
}

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

/**
 * Returns the current window size.
 * On the server, returns `{ width: 0, height: 0 }` to avoid hydration mismatches.
 * On the client, subscribes to resize events via useSyncExternalStore.
 */
export function useWindowSize(): WindowSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
