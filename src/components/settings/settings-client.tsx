"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { useBillingOverview, useCreateCustomerPortalSession } from "@/hooks";
import type { AccountabilityStyle, PreferredTone, DifficultyPreference, Profile, Settings } from "@/api";
import {
  updateProfileAction,
  updateSettingsAction,
  updateCoachingPreferencesAction,
} from "@/app/actions/settings";
import { PlanBadge } from "@/components/billing/plan-badge";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";

interface SettingsClientProps {
  settings: Settings | null;
  profile: Profile | null;
  coachingProfile: {
    accountabilityStyle: AccountabilityStyle;
    preferredTone: PreferredTone;
    difficultyPreference: DifficultyPreference;
  } | null;
}

export function SettingsClient({ settings, profile, coachingProfile }: SettingsClientProps) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, {
    success: false,
  });

  const [settingsState, settingsAction, settingsPending] = useActionState(updateSettingsAction, {
    success: false,
  });

  const [coachingState, coachingAction, coachingPending] = useActionState(updateCoachingPreferencesAction, {
    success: false,
  });

  useEffect(() => {
    if (profileState.success) toast.success("Profile updated");
    else if (profileState.error) toast.error(profileState.error);
  }, [profileState]);

  useEffect(() => {
    if (settingsState.success) toast.success("Settings updated");
    else if (settingsState.error) toast.error(settingsState.error);
  }, [settingsState]);

  useEffect(() => {
    if (coachingState.success) toast.success("Coaching preferences updated");
    else if (coachingState.error) toast.error(coachingState.error);
  }, [coachingState]);

  const handleToggle = useCallback(
    (key: "emailNotifications" | "pushNotifications" | "habitReminders" | "goalReminders", value: boolean) => {
      const formData = new FormData();
      formData.set(key, String(value));
      settingsAction(formData);
    },
    [settingsAction]
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

  if (!profile || !settings) {
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
            <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
          </header>

          {/* Account */}
          <form action={profileAction}>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <input type="hidden" name="username" value={profile.username} />
                  <input
                    id="username"
                    defaultValue={profile.username ?? ""}
                    readOnly
                    className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background text-muted-foreground"
                  />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input
                    id="email"
                    defaultValue={profile.email ?? ""}
                    readOnly
                    className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background text-muted-foreground"
                  />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    defaultValue={profile.fullName ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" disabled={profilePending}>
                  {profilePending ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>

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

          {/* Preferences */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Email Notifications</span>
                  <p className="text-xs text-muted-foreground">Receive email updates about your activity</p>
                </div>
                <Switch
                  checked={settings.emailNotifications ?? false}
                  onCheckedChange={(v) => handleToggle("emailNotifications", v)}
                  disabled={settingsPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Push Notifications</span>
                  <p className="text-xs text-muted-foreground">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={settings.pushNotifications ?? false}
                  onCheckedChange={(v) => handleToggle("pushNotifications", v)}
                  disabled={settingsPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Habit Reminders</span>
                  <p className="text-xs text-muted-foreground">Get reminded to complete your daily habits</p>
                </div>
                <Switch
                  checked={settings.habitReminders ?? false}
                  onCheckedChange={(v) => handleToggle("habitReminders", v)}
                  disabled={settingsPending}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Goal Reminders</span>
                  <p className="text-xs text-muted-foreground">Get reminded about your goal deadlines</p>
                </div>
                <Switch
                  checked={settings.goalReminders ?? false}
                  onCheckedChange={(v) => handleToggle("goalReminders", v)}
                  disabled={settingsPending}
                />
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
        if (data.data?.portalUrl) {
          window.location.href = data.data.portalUrl;
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
