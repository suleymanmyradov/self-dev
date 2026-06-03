import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string, defaultValue = false): boolean {
  function getSnapshot() {
    return window.matchMedia(query).matches
  }

  function getServerSnapshot() {
    return defaultValue
  }

  function subscribe(callback: () => void) {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
