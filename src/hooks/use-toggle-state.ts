import { useState, useCallback, useRef, useLayoutEffect } from "react";

/**
 * Reusable toggle state hook for like/save interactions
 * Reduces boilerplate in components that need toggle + counter logic
 */
export function useToggleState(initialValue: number, onToggle?: (id: string) => void) {
  const [value, setValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);
  const onToggleRef = useRef(onToggle);
  useLayoutEffect(() => {
    onToggleRef.current = onToggle;
  });

  const toggle = useCallback(
    (e: React.MouseEvent, id?: string) => {
      e.preventDefault();
      e.stopPropagation();

      setIsActive((prevActive) => {
        if (prevActive) {
          setValue((v) => Math.max(0, v - 1));
        } else {
          setValue((v) => v + 1);
          if (id) onToggleRef.current?.(id);
        }
        return !prevActive;
      });
    },
    []
  );

  return { value, isActive, toggle };
}
