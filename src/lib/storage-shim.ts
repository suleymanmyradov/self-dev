type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear" | "key"> & { length: number };

type StorageHost = {
  localStorage?: StorageLike;
} & Record<string, unknown>;

const createMemoryStorage = (): StorageLike => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(String(key), String(value));
    },
  };
};

const isValidStorage = (value: unknown): value is StorageLike => {
  if (!value) return false;

  return ["getItem", "setItem", "removeItem", "clear", "key"].every(
    (method) => typeof (value as Record<string, unknown>)[method] === "function",
  );
};

const assignStorage = (host: StorageHost, storage: StorageLike) => {
  try {
    Object.defineProperty(host, "localStorage", {
      configurable: true,
      enumerable: true,
      value: storage,
      writable: true,
    });
  } catch {
    host.localStorage = storage;
  }
};

export const ensureLocalStorageShim = (host?: StorageHost): StorageLike => {
  const target: StorageHost = host ?? ((typeof window !== "undefined" ? window : globalThis) as StorageHost);
  const existing = target.localStorage;

  if (isValidStorage(existing)) {
    return existing;
  }

  const fallback = createMemoryStorage();
  assignStorage(target, fallback);
  return fallback;
};

if (typeof window === "undefined") {
  ensureLocalStorageShim(globalThis as StorageHost);
}
