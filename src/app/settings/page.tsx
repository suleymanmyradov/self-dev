"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { FormField } from "@/components/form-field";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, updateProfile } from "@/api";
import { useSettings, useUpdateSettings, useCoachingProfile, useBillingOverview, useCreateCustomerPortalSession } from "@/hooks";
import type { Profile, UpdateProfileRequest, AccountabilityStyle, PreferredTone, DifficultyPreference } from "@/api";
import { PlanBadge } from "@/components/billing/plan-badge";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";

const accountSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.string().email("Invalid email address"),
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { profile: coachingProfile, updatePreferences, loading: coachingLoading } = useCoachingProfile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formData, setFormData] = useState<AccountFormData>({
    username: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await getCurrentUser();
        setProfile(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const updateField = (field: keyof AccountFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = accountSchema.safeParse({
      username: formData.username.trim(),
      email: formData.email.trim(),
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AccountFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AccountFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    const payload = result.data;

    try {
      const profilePayload: UpdateProfileRequest = {
        fullName: profile?.fullName || payload.username,
      };
      await updateProfile(profilePayload);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

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
        accountabilityStyle: field === "accountabilityStyle" ? value as AccountabilityStyle : coachingProfile?.accountabilityStyle || "balanced",
        preferredTone: field === "preferredTone" ? value as PreferredTone : coachingProfile?.preferredTone || "supportive",
        difficultyPreference: field === "difficultyPreference" ? value as DifficultyPreference : coachingProfile?.difficultyPreference || "adaptive",
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
                  value={formData.username}
                  onChange={updateField("username")}
                  placeholder="yourname"
                  error={errors.username}
                  disabled={isLoading}
                />
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={updateField("email")}
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
                      {(["gentle", "balanced", "strict"] as AccountabilityStyle[]).map((style) => (
                        <Button
                          key={style}
                          variant={coachingProfile?.accountabilityStyle === style ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCoachingPreferenceChange("accountabilityStyle", style)}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Communication Tone</span>
                    <p className="text-xs text-muted-foreground mb-3">How should your AI coach communicate with you?</p>
                    <div className="flex flex-wrap gap-2">
                      {(["supportive", "direct", "warm", "practical", "challenging"] as PreferredTone[]).map((tone) => (
                        <Button
                          key={tone}
                          variant={coachingProfile?.preferredTone === tone ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCoachingPreferenceChange("preferredTone", tone)}
                        >
                          {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium">Difficulty Preference</span>
                    <p className="text-xs text-muted-foreground mb-3">How challenging should your goals and habits be?</p>
                    <div className="flex gap-2">
                      {(["easy", "adaptive", "ambitious"] as DifficultyPreference[]).map((difficulty) => (
                        <Button
                          key={difficulty}
                          variant={coachingProfile?.difficultyPreference === difficulty ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCoachingPreferenceChange("difficultyPreference", difficulty)}
                        >
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Button>
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
  const { data: billing, isLoading } = useBillingOverview();
  const portalMutation = useCreateCustomerPortalSession();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading plan info...</p>;
  }

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
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
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
              Manage billing
            </Button>
          </div>
        </>
      )}

      {!isPro && (
        <>
          <Separator />
          <div className="rounded-lg bg-energy/5 border border-energy/20 p-3">
            <p className="text-xs text-muted-foreground">
              Upgrade to Pro for unlimited goals, full weekly review history, and personalized AI coaching.
              {" "}
              <Link href="/pricing" className="text-energy hover:underline">
                View plans
              </Link>
            </p>
          </div>
        </>
      )}
    </>
  );
}
