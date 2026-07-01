'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/store/uiStore';
import { SECONDARY_COLORS, applyColorToRoot } from '@/lib/secondary-colors';

/**
 * Applies the persisted secondary color to :root on every page.
 * Must be rendered inside ThemeProvider so it can read the current theme.
 */
export function SecondaryColorProvider() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const secondaryColor = useUIStore((s) => s.secondaryColor);
  const hasHydrated = useUIStore((s) => s.hasHydrated);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted || !hasHydrated) return;
    const color = SECONDARY_COLORS.find((c) => c.name.toLowerCase() === secondaryColor);
    if (!color) return;
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
    applyColorToRoot(color, isDark);
  }, [mounted, hasHydrated, theme, systemTheme, secondaryColor]);

  return null;
}
