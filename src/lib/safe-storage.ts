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
    return window.localStorage as StateStorage;
  } catch {
    return noopStorage;
  }
};
