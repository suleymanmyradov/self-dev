"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth";
import { logout as apiLogout } from "@/api";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await apiLogout();
      } catch {
        // API call may fail if token is already expired — that's fine
      }
      logout();
      // Small delay to show feedback then redirect home
      setTimeout(() => router.replace("/"), 300);
    };
    performLogout();
  }, [router, logout]);

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
