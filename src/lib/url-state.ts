"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

/**
 * Sync a piece of UI state to a URL search parameter.
 * Uses `router.replace` so we don't pollute browser history.
 * When the new value matches the default, the key is removed from the URL.
 */
export function useSearchParamState(
  key: string,
  defaultValue: string = ""
): [string, (value: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    return searchParams.get(key) ?? defaultValue;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!newValue || newValue === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams, key, defaultValue]
  );

  return [value, setValue];
}

/**
 * Like `useSearchParamState`, but validates against a set of allowed values.
 * Falls back to `defaultValue` if the URL contains an invalid value.
 */
export function useSearchParamEnum<T extends string>(
  key: string,
  allowedValues: readonly T[],
  defaultValue: T
): [T, (value: T) => void] {
  const [raw, setRaw] = useSearchParamState(key, defaultValue);

  const value = useMemo<T>(() => {
    return allowedValues.includes(raw as T) ? (raw as T) : defaultValue;
  }, [raw, allowedValues, defaultValue]);

  const setValue = useCallback(
    (newValue: T) => setRaw(newValue),
    [setRaw]
  );

  return [value, setValue];
}
