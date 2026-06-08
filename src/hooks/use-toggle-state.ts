import { useState, useCallback, useRef, useLayoutEffect } from "react";

interface ToggleState {
  value: number;
  isActive: boolean;
}

/**
 * Reusable toggle state hook for like/save interactions
 * Reduces boilerplate in components that need toggle + counter logic
 */
export function useToggleState(
  initialValue: number,
  initialActive = false,
  onToggle?: (id: string) => void
) {
  const [state, setState] = useState<ToggleState>({
    value: initialValue,
    isActive: initialActive,
  });
  const onToggleRef = useRef(onToggle);
  useLayoutEffect(() => {
    onToggleRef.current = onToggle;
  });

  const toggle = useCallback(
    (e: React.MouseEvent, id?: string) => {
      e.preventDefault();
      e.stopPropagation();

      setState((prev) => {
        const nextActive = !prev.isActive;
        const nextValue = nextActive ? prev.value + 1 : Math.max(0, prev.value - 1);
        if (nextActive && id) onToggleRef.current?.(id);
        return { value: nextValue, isActive: nextActive };
      });
    },
    []
  );

  return { value: state.value, isActive: state.isActive, toggle };
}
