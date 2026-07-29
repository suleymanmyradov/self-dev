import { ProfileClient } from '@/components/profile/profile-client';
import {
  getCurrentUserServer,
  getSettingsServer,
  getCoachingProfileServer,
  getNotificationPreferencesServer,
  getBillingOverviewServer,
} from '@/api/server';
import { notFound } from 'next/navigation';
import { swallowNotFound, swallowOptional } from '@/lib/server-data';
import type {
  Settings,
  NotificationPreferences,
  AccountabilityStyle,
  PreferredTone,
  DifficultyPreference,
} from '@/api';

export default async function ProfilePage() {
  // 404 → notFound() page. 500/network → throw to error.tsx.
  const profileData = await swallowNotFound(getCurrentUserServer(), null);
  const profile = profileData?.data;

  if (!profile) {
    notFound();
  }

  // Fetch settings, coaching profile, notification preferences, and billing
  // in parallel. These are optional — swallowNotFound returns null on 404.
  const [settingsResp, coachingProfile, notifResp, billingInitialData] = await Promise.all([
    swallowNotFound(getSettingsServer(), null),
    swallowNotFound(getCoachingProfileServer(), null),
    swallowNotFound(getNotificationPreferencesServer(), null),
    swallowOptional(getBillingOverviewServer(), null),
  ]);

  const settings: Settings | null = settingsResp?.data ?? null;
  const notificationPreferences: NotificationPreferences | null = notifResp?.preferences ?? null;
  const coaching = coachingProfile
    ? {
        accountabilityStyle: coachingProfile.accountabilityStyle as AccountabilityStyle,
        preferredTone: coachingProfile.preferredTone as PreferredTone,
        difficultyPreference: coachingProfile.difficultyPreference as DifficultyPreference,
      }
    : null;

  return (
    <ProfileClient
      profile={profile}
      settings={settings}
      coachingProfile={coaching}
      notificationPreferences={notificationPreferences}
      billingInitialData={billingInitialData ?? undefined}
    />
  );
}
