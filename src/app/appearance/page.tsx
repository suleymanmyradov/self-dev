"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AppearancePage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = (val: string) => (theme === val || (!theme && val === "system"))
    ? "bg-primary text-primary-foreground"
    : "";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
            <p className="text-sm text-muted-foreground">Choose how the app looks to you.</p>
          </header>

          <Card>
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
        </div>
      </div>
    </div>
  );
}
