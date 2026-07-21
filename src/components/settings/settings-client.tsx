"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { useBillingOverview, useCreateCustomerPortalSession } from "@/hooks";
import type { AccountabilityStyle, PreferredTone, DifficultyPreference, Settings, NotificationPreferences } from "@/api";
import {
  updateSettingsAction,
  updateNotificationPreferencesAction,
  updateCoachingPreferencesAction,
} from "@/lib/actions/settings";
import { PlanBadge } from "@/components/billing/plan-badge";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";

interface SettingsClientProps {
  settings: Settings | null;
  coachingProfile: {
    accountabilityStyle: AccountabilityStyle;
    preferredTone: PreferredTone;
    difficultyPreference: DifficultyPreference;
  } | null;
  notificationPreferences: NotificationPreferences | null;
}

export function SettingsClient({ settings, coachingProfile, notificationPreferences }: SettingsClientProps) {
  const [settingsState, settingsAction, settingsPending] = useActionState(updateSettingsAction, {
    success: false,
  });

  const [notifState, notifAction, notifPending] = useActionState(updateNotificationPreferencesAction, {
    success: false,
  });

  const [coachingState, coachingAction, coachingPending] = useActionState(updateCoachingPreferencesAction, {
    success: false,
  });

  useEffect(() => {
    if (settingsState.success) toast.success("Settings updated");
    else if (settingsState.error) toast.error(settingsState.error);
  }, [settingsState]);

  useEffect(() => {
    if (notifState.success) toast.success("Notification preferences updated");
    else if (notifState.error) toast.error(notifState.error);
  }, [notifState]);

  useEffect(() => {
    if (coachingState.success) toast.success("Coaching preferences updated");
    else if (coachingState.error) toast.error(coachingState.error);
  }, [coachingState]);

  const handleHabitRemindersToggle = useCallback(
    (value: boolean) => {
      const formData = new FormData();
      formData.set("habitRemindersEnabled", String(value));
      notifAction(formData);
    },
    [notifAction]
  );

  const handleCoachingChange = useCallback(
    (field: "accountabilityStyle" | "preferredTone" | "difficultyPreference", value: string) => {
      const current = coachingProfile ?? {
        accountabilityStyle: "balanced" as AccountabilityStyle,
        preferredTone: "supportive" as PreferredTone,
        difficultyPreference: "adaptive" as DifficultyPreference,
      };
      const formData = new FormData();
      formData.set("accountabilityStyle", field === "accountabilityStyle" ? value : current.accountabilityStyle);
      formData.set("preferredTone", field === "preferredTone" ? value : current.preferredTone);
      formData.set("difficultyPreference", field === "difficultyPreference" ? value : current.difficultyPreference);
      coachingAction(formData);
    },
    [coachingAction, coachingProfile]
  );

  if (!settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences.</p>
          </header>

          {/* Appearance */}
          <AppearanceSection />

          {/* Billing / Plan */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Plan &amp; Billing
                <PlanBadge />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <BillingSection />
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">In-app notifications</span>
                  <p className="text-xs text-muted-foreground">Receive notifications in the app</p>
                </div>
                <Switch checked disabled />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Habit reminders</span>
                  <p className="text-xs text-muted-foreground">Get reminded to complete your daily habits</p>
                </div>
                <Switch
                  checked={notificationPreferences?.habitRemindersEnabled ?? true}
                  onCheckedChange={handleHabitRemindersToggle}
                  disabled={notifPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Email notifications</span>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
                <Switch checked={false} disabled />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Browser push</span>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
                <Switch checked={false} disabled />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Goal deadline reminders</span>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
                <Switch checked={false} disabled />
              </div>
            </CardContent>
          </Card>

          {/* AI Coaching Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>AI Coaching Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div>
                <span className="text-sm font-medium">Accountability Style</span>
                <p className="text-xs text-muted-foreground mb-3">How strict should your AI coach be?</p>
                <div className="flex gap-2">
                  {(["gentle", "balanced", "strict"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleCoachingChange("accountabilityStyle", style)}
                      disabled={coachingPending}
                      className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors disabled:opacity-50 ${
                        coachingProfile?.accountabilityStyle === style
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Preferred Tone</span>
                <p className="text-xs text-muted-foreground mb-3">What tone do you want your coach to use?</p>
                <div className="flex gap-2">
                  {(["supportive", "direct", "warm", "practical", "challenging"] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => handleCoachingChange("preferredTone", tone)}
                      disabled={coachingPending}
                      className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors disabled:opacity-50 ${
                        coachingProfile?.preferredTone === tone
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Difficulty Preference</span>
                <p className="text-xs text-muted-foreground mb-3">How challenging should your plans be?</p>
                <div className="flex gap-2">
                  {(["easy", "adaptive", "ambitious"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => handleCoachingChange("difficultyPreference", diff)}
                      disabled={coachingPending}
                      className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors disabled:opacity-50 ${
                        coachingProfile?.difficultyPreference === diff
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BillingSection() {
  const { data: billing } = useBillingOverview();
  const portalMutation = useCreateCustomerPortalSession();

  const subscription = billing?.subscription;
  const isPro = subscription?.planCode === "pro";

  const handleManageBilling = () => {
    portalMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.portalUrl) {
          window.location.href = data.portalUrl;
        }
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">Current Plan</span>
          <p className="text-xs text-muted-foreground">
            {isPro ? "Growth Pro" : "Free"} — {subscription?.planName ?? "Core accountability loop"}
          </p>
        </div>
        {!isPro && (
          <Link href="/pricing">
            <Button size="sm" variant="energy">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>

      {isPro && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Billing</span>
              <p className="text-xs text-muted-foreground">
                {subscription?.billingInterval === "annual" ? "Annual plan" : "Monthly plan"}
                {subscription?.cancelAtPeriodEnd && " — Cancels at period end"}
              </p>
              {subscription?.currentPeriodEnd && (
                <p className="text-xs text-muted-foreground">
                  {subscription.cancelAtPeriodEnd ? "Access until" : "Renews on"}{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalMutation.isPending}
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              Manage
            </Button>
          </div>
        </>
      )}
    </>
  );
}

function AppearanceSection() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isThemeActive = (value: string): boolean =>
    mounted && (theme === value || (!theme && value === "system"));

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <span className="text-sm font-medium">Theme</span>
          <p className="text-xs text-muted-foreground mb-3">Choose how the app looks to you.</p>
          <div className="flex items-center gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant="outline"
                onClick={() => setTheme(t)}
                className={isThemeActive(t) ? "bg-primary text-primary-foreground" : ""}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            {mounted
              ? theme === "system" || !theme
                ? `Following system: ${systemTheme ?? "light"}`
                : `Current theme: ${theme}`
              : "Detecting current theme..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
