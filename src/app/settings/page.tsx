"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/store/profile";

export default function SettingsPage() {
  const { profile, hasHydrated, setProfile, updateProfile } = useProfile();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    setUsername(profile?.username ?? "");
    setEmail(profile?.email ?? "");
  }, [hasHydrated, profile?.id]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
          </header>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={() => {
                  setSaving(true);
                  const payload = { username: username.trim(), email: email.trim() };
                  if (!profile) {
                    setProfile({ fullName: username.trim() || "User", username: payload.username, email: payload.email });
                  } else {
                    updateProfile(payload);
                  }
                  setTimeout(() => setSaving(false), 200);
                }}
                disabled={!hasHydrated || saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Theme, notifications and more coming soon.</p>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Button disabled size="sm" variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
