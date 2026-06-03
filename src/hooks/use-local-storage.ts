import { useCallback, useSyncExternalStore } from 'react'

const LOCAL_STORAGE_EVENT = 'local-storage'

function createSubscribe(key: string) {
  return function subscribe(callback: () => void) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) callback()
    }
    const onCustom = () => callback()

    window.addEventListener('storage', onStorage)
    window.addEventListener(LOCAL_STORAGE_EVENT, onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(LOCAL_STORAGE_EVENT, onCustom)
    }
  }
}

function createGetSnapshot(key: string) {
  return function getSnapshot(): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }
}

function getServerSnapshot(): null {
  return null
}

function parseJSON<T>(raw: string | null, initialValue: T): T {
  if (raw === null) return initialValue
  try {
    return JSON.parse(raw) as T
  } catch {
    return initialValue
  }
}

/**
 * Syncs state to localStorage with SSR safety.
 * On the server, returns the initialValue.
 * On the client, reads from localStorage and subscribes to changes
 * across tabs (storage event) and within the same tab (custom event).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (callback: () => void) => createSubscribe(key)(callback),
    [key]
  )
  const getSnapshot = useCallback(
    () => createGetSnapshot(key)(),
    [key]
  )

  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const value = parseJSON(storedValue, initialValue)

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const raw = window.localStorage.getItem(key)
        const current = parseJSON(raw, initialValue)
        const next = newValue instanceof Function ? newValue(current) : newValue
        window.localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT))
      } catch {
        // Silently ignore write errors (e.g. private browsing mode)
      }
    },
    [key, initialValue]
  )

  return [value, setValue]
}
