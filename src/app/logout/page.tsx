"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Clear known persisted stores
      localStorage.removeItem("habits");
      localStorage.removeItem("goals");
      localStorage.removeItem("profile");
      // Optionally clear other app keys if any exist later
    } catch {}
    // Small delay to show feedback then redirect home
    const t = setTimeout(() => router.replace("/"), 300);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-sm px-4 py-6 md:py-8">
          <Card>
            <CardHeader>
              <CardTitle>Logging out</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Clearing your local data and redirecting…</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
