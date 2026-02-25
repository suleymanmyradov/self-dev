"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const secondaryColors = [
  { name: "Gray", value: "oklch(0.96 0 0)", darkValue: "oklch(0.22 0 0)" },
  { name: "Green", value: "oklch(0.96 0.02 140)", darkValue: "oklch(0.28 0.02 260)" },
  { name: "Blue", value: "oklch(0.96 0.02 240)", darkValue: "oklch(0.28 0.02 260)" },
  { name: "Purple", value: "oklch(0.96 0.02 290)", darkValue: "oklch(0.28 0.02 290)" },
  { name: "Orange", value: "oklch(0.96 0.02 50)", darkValue: "oklch(0.28 0.02 50)" },
  { name: "Rose", value: "oklch(0.96 0.02 340)", darkValue: "oklch(0.28 0.02 340)" },
];

export default function AppearancePage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [secondaryColor, setSecondaryColor] = useState("gray");
  
  useEffect(() => setMounted(true), []);
  
  const applySecondaryColor = useCallback((colorName: string) => {
    const color = secondaryColors.find((c) => c.name.toLowerCase() === colorName.toLowerCase());
    if (!color) return;
    
    const root = document.documentElement;
    const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");
    root.style.setProperty("--secondary", isDark ? color.darkValue : color.value);
    root.style.setProperty("--secondary-foreground", isDark ? "oklch(0.98 0 0)" : "oklch(0.22 0.02 260)");
  }, [theme, systemTheme]);

  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem("secondary-color") || "gray";
      setSecondaryColor(stored);
      applySecondaryColor(stored);
    }
  }, [mounted, applySecondaryColor]);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("secondary-color") || "gray";
      setSecondaryColor(stored);
      applySecondaryColor(stored);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [applySecondaryColor]);

  const handleSecondaryColorChange = (colorName: string) => {
    setSecondaryColor(colorName);
    localStorage.setItem("secondary-color", colorName);
    applySecondaryColor(colorName);
  };

  useEffect(() => {
    applySecondaryColor(secondaryColor);
  }, [theme, systemTheme, applySecondaryColor, secondaryColor]);

  const active = (val: string) => (theme === val || (!theme && val === "system"))
    ? "bg-primary text-primary-foreground"
    : "";

  const activeSecondary = (name: string) => secondaryColor === name.toLowerCase()
    ? "ring-2 ring-primary ring-offset-2"
    : "";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
            <p className="text-sm text-muted-foreground">Choose how the app looks to you.</p>
          </header>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setTheme("light")} className={active("light")}>Light</Button>
                <Button variant="outline" onClick={() => setTheme("dark")} className={active("dark")}>Dark</Button>
                <Button variant="outline" onClick={() => setTheme("system")} className={active("system")}>System</Button>
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                {mounted ? (
                  theme === "system" || !theme ? `Following system: ${systemTheme ?? "light"}` : `Current theme: ${theme}`
                ) : (
                  "Detecting current theme..."
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secondary Color</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Choose the accent color for secondary elements.</p>
              <div className="flex flex-wrap gap-3">
                {secondaryColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleSecondaryColorChange(color.name.toLowerCase())}
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-105 ${activeSecondary(color.name)}`}
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
