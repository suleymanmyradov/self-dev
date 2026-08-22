"use client";

import { Switch } from "@/components/ui/switch";
import type { NotificationPreferences } from "@/api";

export function NotificationsSection({
  notificationPreferences,
  notifPending,
  onEmailToggle,
  onPushToggle,
}: {
  notificationPreferences: NotificationPreferences | null;
  notifPending: boolean;
  onEmailToggle: (value: boolean) => void;
  onPushToggle: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Notifications</h1>

      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">In-app notifications</p>
            <p className="text-xs text-muted-foreground">Important updates always appear in your notification panel</p>
          </div>
          <Switch checked disabled />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Email notifications</p>
            <p className="text-xs text-muted-foreground">Receive enabled reminders at your verified email address</p>
          </div>
          <Switch
            checked={notificationPreferences?.emailEnabled ?? false}
            onCheckedChange={onEmailToggle}
            disabled={notifPending}
          />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Mobile push</p>
            <p className="text-xs text-muted-foreground">Allow Growth to send enabled reminders to registered mobile devices</p>
          </div>
          <Switch
            checked={notificationPreferences?.pushEnabled ?? false}
            onCheckedChange={onPushToggle}
            disabled={notifPending}
          />
        </div>
      </div>
    </div>
  );
}
