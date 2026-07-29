"use client";

import { Switch } from "@/components/ui/switch";
import type { NotificationPreferences } from "@/api";

export function NotificationsSection({
  notificationPreferences,
  notifPending,
  onHabitRemindersToggle,
}: {
  notificationPreferences: NotificationPreferences | null;
  notifPending: boolean;
  onHabitRemindersToggle: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Notifications</h1>

      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">In-app notifications</p>
            <p className="text-xs text-muted-foreground">Receive notifications in the app</p>
          </div>
          <Switch checked disabled />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Habit reminders</p>
            <p className="text-xs text-muted-foreground">Get reminded to complete your daily habits</p>
          </div>
          <Switch
            checked={notificationPreferences?.habitRemindersEnabled ?? true}
            onCheckedChange={onHabitRemindersToggle}
            disabled={notifPending}
          />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Email notifications</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
          <Switch checked={false} disabled />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Browser push</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
          <Switch checked={false} disabled />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Goal deadline reminders</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
          <Switch checked={false} disabled />
        </div>
      </div>
    </div>
  );
}
