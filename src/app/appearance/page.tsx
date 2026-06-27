"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/store/uiStore";

// =============================================================================
// Constants
// =============================================================================

interface SecondaryColor {
  name: string;
  value: string;
  darkValue: string;
}

const SECONDARY_COLORS: SecondaryColor[] = [
  { name: "Gray", value: "oklch(0.96 0 0)", darkValue: "oklch(0.22 0 0)" },
  { name: "Green", value: "oklch(0.96 0.02 140)", darkValue: "oklch(0.28 0.02 260)" },
  { name: "Blue", value: "oklch(0.96 0.02 240)", darkValue: "oklch(0.28 0.02 260)" },
  { name: "Purple", value: "oklch(0.96 0.02 290)", darkValue: "oklch(0.28 0.02 290)" },
  { name: "Orange", value: "oklch(0.96 0.02 50)", darkValue: "oklch(0.28 0.02 50)" },
  { name: "Rose", value: "oklch(0.96 0.02 340)", darkValue: "oklch(0.28 0.02 340)" },
];

function applyColorToRoot(color: SecondaryColor, isDark: boolean): void {
  const root = document.documentElement;
  root.style.setProperty("--secondary", isDark ? color.darkValue : color.value);
  root.style.setProperty("--secondary-foreground", isDark ? "oklch(0.98 0 0)" : "oklch(0.22 0.02 260)");
}

// =============================================================================
// Component
// =============================================================================

export default function AppearancePage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const secondaryColor = useUIStore((s) => s.secondaryColor);
  const setSecondaryColor = useUIStore((s) => s.setSecondaryColor);

  // Mount effect
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Apply secondary color when theme or color changes
  useEffect(() => {
    if (!mounted) return;
    const color = SECONDARY_COLORS.find((c) => c.name.toLowerCase() === secondaryColor);
    if (!color) return;
    const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");
    applyColorToRoot(color, isDark);
  }, [mounted, theme, systemTheme, secondaryColor]);

  // Only treat a theme as active after mount to avoid hydration mismatch
  // (next-themes reads localStorage on the client only).
  const isThemeActive = (value: string): boolean =>
    mounted && (theme === value || (!theme && value === "system"));

  const isColorActive = (name: string): boolean =>
    mounted && secondaryColor === name.toLowerCase();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
            <p className="text-sm text-muted-foreground">Choose how the app looks to you.</p>
          </header>

          {/* Theme Selection */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {(["light", "dark", "system"] as const).map((t) => (
                  <Button
                    key={t}
                    variant="outline"
                    onClick={() => setTheme(t)}
                    className={isThemeActive(t) ? "bg-primary text-primary-foreground" : ""}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                {mounted
                  ? theme === "system" || !theme
                    ? `Following system: ${systemTheme ?? "light"}`
                    : `Current theme: ${theme}`
                  : "Detecting current theme..."}
              </p>
            </CardContent>
          </Card>

          {/* Secondary Color Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Secondary Color</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the accent color for secondary elements.
              </p>
              <div className="flex flex-wrap gap-3">
                {SECONDARY_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSecondaryColor(color.name.toLowerCase())}
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-105 ${
                      isColorActive(color.name) ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
