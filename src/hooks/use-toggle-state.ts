import { useState, useCallback } from "react";

/**
 * Reusable toggle state hook for like/save interactions
 * Reduces boilerplate in components that need toggle + counter logic
 */
export function useToggleState(initialValue: number, onToggle?: (id: string) => void) {
  const [value, setValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);

  const toggle = useCallback(
    (e: React.MouseEvent, id?: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isActive) {
        setValue((v) => Math.max(0, v - 1));
        setIsActive(false);
      } else {
        setValue((v) => v + 1);
        setIsActive(true);
        if (id) onToggle?.(id);
      }
    },
    [isActive, onToggle]
  );

  return { value, isActive, toggle };
}
