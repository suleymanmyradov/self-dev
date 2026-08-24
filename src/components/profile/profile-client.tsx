"use client";

import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import type {
  AccountabilityStyle,
  PreferredTone,
  DifficultyPreference,
  NotificationPreferences,
} from "@/api";
import {
  updateProfileAction,
  updateSettingsAction,
  updateNotificationPreferencesAction,
  updateCoachingPreferencesAction,
} from "@/lib/actions/settings";
import { useBillingOverview } from "@/hooks";
import { cn } from "@/lib/utils";
import { ProfileClientProps, SectionId, NAV_ITEMS } from "@/components/profile/types";
import { ProfileSection } from "@/components/profile/profile-section";
import { CoachingSection } from "@/components/profile/coaching-section";
import { MemorySection } from "@/components/profile/memory-section";
import { RemindersSection } from "@/components/profile/reminders-section";
import { NotificationsSection } from "@/components/profile/notifications-section";
import { AppearanceSection } from "@/components/profile/appearance-section";
import { PlanSection } from "@/components/profile/plan-section";
import { DataSection } from "@/components/profile/data-section";

export function ProfileClient({
  profile,
  settings,
  coachingProfile,
  notificationPreferences,
  billingInitialData,
}: ProfileClientProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  // Profile form state
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, {
    success: false,
  });
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [settingsState, settingsAction, settingsPending] = useActionState(updateSettingsAction, {
    success: false,
  });
  const [notifState, notifAction, notifPending] = useActionState(updateNotificationPreferencesAction, {
    success: false,
  });
  const [coachingState, coachingAction, coachingPending] = useActionState(updateCoachingPreferencesAction, {
    success: false,
  });

  // Notification preferences — derived from the server response so toggles
  // reflect persisted state. Defaults match the backend table defaults.
  const prefs = notificationPreferences;
  const habitReminders = prefs?.habitRemindersEnabled ?? true;
  const emailEnabled = prefs?.emailEnabled ?? false;
  const pushEnabled = prefs?.pushEnabled ?? false;
  const goalReminders = prefs?.goalRemindersEnabled ?? false;
  const streakWarnings = prefs?.streakWarningsEnabled ?? false;
  const sundayReview = prefs?.sundayReviewEnabled ?? false;

  // Billing
  const { data: billing } = useBillingOverview(billingInitialData);
  const isPro = billing?.subscription?.planCode === "pro";

  // Toast effects
  useEffect(() => {
    if (profileState.success) toast.success("Profile updated successfully");
    else if (profileState.error) toast.error(profileState.error);
  }, [profileState]);

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

  // Notification preference toggle handlers. The backend upserts the full
  // preferences object, so every toggle sends all fields (current values plus
  // the one being changed) to avoid clobbering the others.
  const submitPrefs = useCallback(
    (overrides: Partial<NotificationPreferences>) => {
      const merged: NotificationPreferences = {
        emailEnabled,
        pushEnabled,
        habitRemindersEnabled: habitReminders,
        goalRemindersEnabled: goalReminders,
        streakWarningsEnabled: streakWarnings,
        sundayReviewEnabled: sundayReview,
        ...overrides,
      };
      const formData = new FormData();
      formData.set("emailEnabled", String(merged.emailEnabled));
      formData.set("pushEnabled", String(merged.pushEnabled));
      formData.set("habitRemindersEnabled", String(merged.habitRemindersEnabled));
      formData.set("goalRemindersEnabled", String(merged.goalRemindersEnabled));
      formData.set("streakWarningsEnabled", String(merged.streakWarningsEnabled));
      formData.set("sundayReviewEnabled", String(merged.sundayReviewEnabled));
      startTransition(() => {
        notifAction(formData);
      });
    },
    [notifAction, emailEnabled, pushEnabled, habitReminders, goalReminders, streakWarnings, sundayReview],
  );

  const handleEmailToggle = useCallback(
    (value: boolean) => submitPrefs({ emailEnabled: value }),
    [submitPrefs],
  );
  const handlePushToggle = useCallback(
    (value: boolean) => submitPrefs({ pushEnabled: value }),
    [submitPrefs],
  );
  const handleHabitRemindersToggle = useCallback(
    (value: boolean) => submitPrefs({ habitRemindersEnabled: value }),
    [submitPrefs],
  );
  const handleGoalRemindersToggle = useCallback(
    (value: boolean) => submitPrefs({ goalRemindersEnabled: value }),
    [submitPrefs],
  );
  const handleStreakWarningsToggle = useCallback(
    (value: boolean) => submitPrefs({ streakWarningsEnabled: value }),
    [submitPrefs],
  );
  const handleSundayReviewToggle = useCallback(
    (value: boolean) => submitPrefs({ sundayReviewEnabled: value }),
    [submitPrefs],
  );

  // Settings (timezone, checkInTime) — submitted via the settings action, not
  // the profile action, because these fields belong to UpdateSettingsRequest.
  const submitSettings = useCallback(
    (overrides: { timezone?: string; checkInTime?: string }) => {
      const formData = new FormData();
      if (overrides.timezone !== undefined) {
        formData.set("timezone", overrides.timezone);
      }
      if (overrides.checkInTime !== undefined) {
        formData.set("checkInTime", overrides.checkInTime);
      }
      startTransition(() => {
        settingsAction(formData);
      });
    },
    [settingsAction],
  );

  const handleCoachingChange = useCallback(
    (overrides: {
      accountabilityStyle?: AccountabilityStyle;
      preferredTone?: PreferredTone;
      difficultyPreference?: DifficultyPreference;
    }) => {
      const current = coachingProfile ?? {
        accountabilityStyle: "balanced" as AccountabilityStyle,
        preferredTone: "supportive" as PreferredTone,
        difficultyPreference: "adaptive" as DifficultyPreference,
      };
      const formData = new FormData();
      formData.set("accountabilityStyle", overrides.accountabilityStyle ?? current.accountabilityStyle);
      formData.set("preferredTone", overrides.preferredTone ?? current.preferredTone);
      formData.set("difficultyPreference", overrides.difficultyPreference ?? current.difficultyPreference);
      startTransition(() => {
        coachingAction(formData);
      });
    },
    [coachingAction, coachingProfile],
  );

  const handleDeleteAccountClick = useCallback(() => {
    setActiveSection("data");
  }, []);

  // Listen for navigation events from child sections (e.g. profile footer
  // "Export everything" link → switch to the data section).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as SectionId;
      if (detail) setActiveSection(detail);
    };
    window.addEventListener("profile:navigate", handler);
    return () => window.removeEventListener("profile:navigate", handler);
  }, []);

  const initials = profile.fullName
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "U";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");
      const res = await fetch("/api/v1/files/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(err.message || "Upload failed");
      }
      const data = (await res.json()) as { url: string };
      setAvatarUrl(data.url);
      toast.success("Photo selected. Save your profile to apply the change.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex h-full">
      {/* ─── Section nav sidebar ─────────────────────────────────────────── */}
      <aside className="w-[212px] shrink-0 border-r border-border bg-card flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-[38px] w-[38px] rounded-full bg-secondary">
              <AvatarImage src={avatarUrl || undefined} alt={profile.fullName || "Avatar"} />
              <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{profile.fullName || profile.username}</p>
              <p className="text-xs text-muted-foreground">
                {isPro ? "Pro" : "Free"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                activeSection === item.id
                  ? "bg-secondary text-secondary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-6 py-8 md:py-10">
          {activeSection === "profile" && (
            <ProfileSection
              profile={profile}
              avatarUrl={avatarUrl}
              initials={initials}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
              uploading={uploading}
              profileAction={profileAction}
              profilePending={profilePending}
              profileError={profileState.error}
              settings={settings}
              onDeleteAccountClick={handleDeleteAccountClick}
            />
          )}

          {activeSection === "coaching" && (
            <CoachingSection
              coachingProfile={coachingProfile}
              coachingPending={coachingPending}
              onCoachingChange={handleCoachingChange}
            />
          )}

          {activeSection === "memory" && <MemorySection />}

          {activeSection === "reminders" && (
            <RemindersSection
              notificationPreferences={notificationPreferences}
              notifPending={notifPending}
              onHabitRemindersToggle={handleHabitRemindersToggle}
              goalReminders={goalReminders}
              onGoalRemindersToggle={handleGoalRemindersToggle}
              streakWarnings={streakWarnings}
              onStreakWarningsChange={handleStreakWarningsToggle}
              sundayReview={sundayReview}
              onSundayReviewChange={handleSundayReviewToggle}
              settings={settings}
              settingsPending={settingsPending}
              onSettingsSave={submitSettings}
            />
          )}

          {activeSection === "notifications" && (
            <NotificationsSection
              notificationPreferences={notificationPreferences}
              notifPending={notifPending}
              onEmailToggle={handleEmailToggle}
              onPushToggle={handlePushToggle}
            />
          )}

          {activeSection === "appearance" && (
            <AppearanceSection />
          )}

          {activeSection === "plan" && (
            <PlanSection billingInitialData={billingInitialData} />
          )}

          {activeSection === "data" && <DataSection />}
        </div>
      </div>
    </div>
  );
}
