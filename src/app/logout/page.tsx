"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/lib/actions/auth";
import { useAuthStore } from "@/store/auth";

export default function LogoutPage() {
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    const performLogout = async () => {
      logout();
      try {
        await logoutAction();
      } catch {
        // Server redirect may throw during navigation — that's fine
      }
    };
    performLogout();
  }, [logout]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
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
