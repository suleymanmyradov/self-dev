import type { StateStorage } from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const getSafeStorage = (): StateStorage => {
  // Check for both window and globalThis (for SSR shim compatibility)
  const globalScope = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : null;

  if (!globalScope) {
    return noopStorage;
  }

  try {
    const storage = (globalScope as Record<string, unknown>).localStorage;

    if (
      !storage ||
      typeof (storage as Record<string, unknown>).getItem !== "function" ||
      typeof (storage as Record<string, unknown>).setItem !== "function" ||
      typeof (storage as Record<string, unknown>).removeItem !== "function"
    ) {
      return noopStorage;
    }

    return storage as StateStorage;
  } catch {
    return noopStorage;
  }
};
