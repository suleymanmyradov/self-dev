"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { FormField } from "@/components/form-field";
import { useSettings, useUpdateSettings, useCoachingProfile, useBillingOverview, useCreateCustomerPortalSession, useProfile } from "@/hooks";
import type { AccountabilityStyle, PreferredTone, DifficultyPreference, Profile, SettingsResponse } from "@/api";
import { updateProfile } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { PlanBadge } from "@/components/billing/plan-badge";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";

interface SettingsClientProps {
  initialSettings?: SettingsResponse;
  initialProfile?: Profile;
}

export function SettingsClient({ initialSettings, initialProfile }: SettingsClientProps) {
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useSettings(initialSettings);
  const updateSettings = useUpdateSettings();
  const { profile: coachingProfile, updatePreferences, loading: coachingLoading } = useCoachingProfile();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(initialProfile);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Partial<Record<"username" | "email", string>>>({});
  const [saving, setSaving] = useState(false);

  // Sync refs when profile loads
  useEffect(() => {
    if (profile) {
      if (usernameRef.current) usernameRef.current.value = profile.username ?? "";
      if (emailRef.current) emailRef.current.value = profile.email ?? "";
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profileError) {
      toast.error("Failed to load profile");
    }
  }, [profileError]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      const username = usernameRef.current?.value.trim() ?? "";
      const email = emailRef.current?.value.trim() ?? "";

      const fieldErrors: Partial<Record<"username" | "email", string>> = {};
      if (username.length < 2) {
        fieldErrors.username = "Username must be at least 2 characters";
      }
      if (!email.includes("@")) {
        fieldErrors.email = "Invalid email address";
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }

      setSaving(true);
      try {
        await updateProfile({ fullName: username });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Settings saved successfully");
      } catch {
        toast.error("Failed to save settings");
      } finally {
        setSaving(false);
      }
    },
    [queryClient]
  );

  const handleSettingToggle = async (
    key: "emailNotifications" | "pushNotifications" | "habitReminders" | "goalReminders",
    value: boolean
  ) => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ [key]: value });
      toast.success(`${key.replace(/([A-Z])/g, " $1").trim()} updated`);
    } catch {
      toast.error("Failed to update setting");
    }
  };

  const handleCoachingPreferenceChange = async (
    field: "accountabilityStyle" | "preferredTone" | "difficultyPreference",
    value: AccountabilityStyle | PreferredTone | DifficultyPreference
  ) => {
    try {
      await updatePreferences({
        accountabilityStyle: field === "accountabilityStyle" ? (value as AccountabilityStyle) : coachingProfile?.accountabilityStyle || "balanced",
        preferredTone: field === "preferredTone" ? (value as PreferredTone) : coachingProfile?.preferredTone || "supportive",
        difficultyPreference: field === "difficultyPreference" ? (value as DifficultyPreference) : coachingProfile?.difficultyPreference || "adaptive",
      });
      toast.success("Coaching preferences updated");
    } catch {
      toast.error("Failed to update coaching preferences");
    }
  };

  const isLoading = settingsLoading || profileLoading;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
          </header>

          <form onSubmit={handleSave}>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  id="username"
                  label="Username"
                  ref={usernameRef}
                  defaultValue={profile?.username ?? ""}
                  placeholder="yourname"
                  error={errors.username}
                  disabled={isLoading}
                />
                <FormField
                  id="email"
                  label="Email"
                  ref={emailRef}
                  type="email"
                  defaultValue={profile?.email ?? ""}
                  placeholder="you@example.com"
                  error={errors.email}
                  disabled={isLoading}
                />
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" disabled={isLoading || saving}>
                  {saving ? "Saving..." : "Save changes"}
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

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading preferences...</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Email Notifications</span>
                      <p className="text-xs text-muted-foreground">Receive email updates about your activity</p>
                    </div>
                    <Switch
                      checked={settings?.emailNotifications ?? false}
                      onCheckedChange={(v: boolean) => handleSettingToggle("emailNotifications", v)}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Push Notifications</span>
                      <p className="text-xs text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={settings?.pushNotifications ?? false}
                      onCheckedChange={(v: boolean) => handleSettingToggle("pushNotifications", v)}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Habit Reminders</span>
                      <p className="text-xs text-muted-foreground">Get reminded to complete your daily habits</p>
                    </div>
                    <Switch
                      checked={settings?.habitReminders ?? false}
                      onCheckedChange={(v: boolean) => handleSettingToggle("habitReminders", v)}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Goal Reminders</span>
                      <p className="text-xs text-muted-foreground">Get reminded about your goal deadlines</p>
                    </div>
                    <Switch
                      checked={settings?.goalReminders ?? false}
                      onCheckedChange={(v: boolean) => handleSettingToggle("goalReminders", v)}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Coaching Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {coachingLoading ? (
                <p className="text-sm text-muted-foreground">Loading coaching preferences...</p>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-medium">Accountability Style</span>
                    <p className="text-xs text-muted-foreground mb-3">How strict should your AI coach be?</p>
                    <div className="flex gap-2">
                      {(["gentle", "balanced", "strict"] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => handleCoachingPreferenceChange("accountabilityStyle", style as AccountabilityStyle)}
                          className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors ${
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
                      {(["supportive", "direct", "motivational"] as const).map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => handleCoachingPreferenceChange("preferredTone", tone as PreferredTone)}
                          className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors ${
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
                      {(["easy", "adaptive", "challenging"] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => handleCoachingPreferenceChange("difficultyPreference", diff as DifficultyPreference)}
                          className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors ${
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BillingSection() {
  const { data: billing } = useBillingOverview();
  const { data: profile } = useProfile();
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

      {(profile as unknown as { subscriptionStatus?: string } | undefined)?.subscriptionStatus === "canceling" && (
        <>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Your subscription will cancel at the end of the current period.
          </p>
        </>
      )}
    </>
  );
}
