"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const currentTheme = mounted ? (theme || "system") : "system";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Appearance</h1>

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Theme</p>
          <p className="text-xs text-muted-foreground mb-3">Choose how the app looks to you.</p>

          {/* Segmented control */}
          <div className="inline-flex rounded-lg bg-secondary p-1 gap-0.5">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                  currentTheme === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            {mounted
              ? theme === "system" || !theme
                ? `Following system: ${systemTheme ?? "light"}`
                : `Current theme: ${theme}`
              : "Detecting current theme..."}
          </p>
        </div>
      </div>
    </div>
  );
}
