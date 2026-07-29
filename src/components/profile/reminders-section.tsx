"use client";

import { Switch } from "@/components/ui/switch";
import type { NotificationPreferences, Settings } from "@/api";

export function RemindersSection({
  notificationPreferences,
  notifPending,
  onHabitRemindersToggle,
  streakWarnings,
  onStreakWarningsChange,
  sundayReview,
  onSundayReviewChange,
  settings,
}: {
  notificationPreferences: NotificationPreferences | null;
  notifPending: boolean;
  onHabitRemindersToggle: (value: boolean) => void;
  streakWarnings: boolean;
  onStreakWarningsChange: (value: boolean) => void;
  sundayReview: boolean;
  onSundayReviewChange: (value: boolean) => void;
  settings: Settings | null;
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Reminders</h1>

      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        {/* Daily nudge */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Daily nudge</p>
            <p className="text-xs text-muted-foreground">One notification, at a time you choose</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {settings?.checkInTime ?? "21:00"}
            </span>
            <Switch
              checked={notificationPreferences?.habitRemindersEnabled ?? true}
              onCheckedChange={onHabitRemindersToggle}
              disabled={notifPending}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Sunday review email */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Sunday review email</p>
            <p className="text-xs text-muted-foreground">Your week, written by the coach</p>
          </div>
          <Switch
            checked={sundayReview}
            onCheckedChange={onSundayReviewChange}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Streak warnings */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Streak warnings</p>
            <p className="text-xs text-muted-foreground">Off by default — pressure isn&apos;t the point</p>
          </div>
          <Switch
            checked={streakWarnings}
            onCheckedChange={onStreakWarningsChange}
          />
        </div>
      </div>
    </div>
  );
}
