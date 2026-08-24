"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { NotificationPreferences, Settings } from "@/api";

export function RemindersSection({
  notificationPreferences,
  notifPending,
  onHabitRemindersToggle,
  goalReminders,
  onGoalRemindersToggle,
  streakWarnings,
  onStreakWarningsChange,
  sundayReview,
  onSundayReviewChange,
  settings,
  settingsPending,
  onSettingsSave,
}: {
  notificationPreferences: NotificationPreferences | null;
  notifPending: boolean;
  onHabitRemindersToggle: (value: boolean) => void;
  goalReminders: boolean;
  onGoalRemindersToggle: (value: boolean) => void;
  streakWarnings: boolean;
  onStreakWarningsChange: (value: boolean) => void;
  sundayReview: boolean;
  onSundayReviewChange: (value: boolean) => void;
  settings: Settings | null;
  settingsPending: boolean;
  onSettingsSave: (overrides: { timezone?: string; checkInTime?: string }) => void;
}) {
  const timezones = Intl.supportedValuesOf("timeZone");
  const [checkInTime, setCheckInTime] = useState(settings?.checkInTime ?? "21:00");
  const [timezone, setTimezone] = useState(settings?.timezone || undefined);

  const handleSaveTimeSettings = () => {
    const overrides: { timezone?: string; checkInTime?: string } = {};
    if (timezone && timezone !== settings?.timezone) {
      overrides.timezone = timezone;
    }
    if (checkInTime !== (settings?.checkInTime ?? "21:00")) {
      overrides.checkInTime = checkInTime;
    }
    if (overrides.timezone !== undefined || overrides.checkInTime !== undefined) {
      onSettingsSave(overrides);
    }
  };

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
            <Input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-[100px] font-mono text-sm tabular-nums"
              disabled={notifPending}
            />
            <Switch
              checked={notificationPreferences?.habitRemindersEnabled ?? true}
              onCheckedChange={onHabitRemindersToggle}
              disabled={notifPending}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Timezone */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Time zone</p>
              <p className="text-xs text-muted-foreground">Reminders fire in your local time</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveTimeSettings}
              disabled={settingsPending}
            >
              {settingsPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <Select
            value={timezone || undefined}
            onValueChange={setTimezone}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-border" />

        {/* Goal reminders */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Goal deadline reminders</p>
            <p className="text-xs text-muted-foreground">Get a morning reminder on goal deadline days</p>
          </div>
          <Switch
            checked={goalReminders}
            onCheckedChange={onGoalRemindersToggle}
            disabled={notifPending}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Sunday review email */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Weekly review</p>
            <p className="text-xs text-muted-foreground">A Sunday invitation to reflect and plan the week ahead</p>
          </div>
          <Switch
            checked={sundayReview}
            onCheckedChange={onSundayReviewChange}
            disabled={notifPending}
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
            disabled={notifPending}
          />
        </div>
      </div>
    </div>
  );
}
