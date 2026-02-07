import type { StateStorage } from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const getSafeStorage = (): StateStorage => {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  try {
    const storage = window.localStorage;

    if (
      !storage ||
      typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function" ||
      typeof storage.removeItem !== "function"
    ) {
      return noopStorage;
    }

    return storage;
  } catch {
    return noopStorage;
  }
};
