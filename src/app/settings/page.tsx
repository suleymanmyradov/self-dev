import { SettingsClient } from '@/components/settings/settings-client';
import { getSettingsServer, getCoachingProfileServer, getNotificationPreferencesServer } from '@/api/server';
import { swallowNotFound } from '@/lib/server-data';

export default async function SettingsPage() {
  // 404 = not configured yet → show defaults. 500/network → throw to error.tsx.
  const [settingsData, coachingProfile, notificationPreferences] = await Promise.all([
    swallowNotFound(getSettingsServer(), null),
    swallowNotFound(getCoachingProfileServer(), null),
    swallowNotFound(getNotificationPreferencesServer(), null),
  ]);

  return (
    <SettingsClient
      settings={settingsData?.data ?? null}
      coachingProfile={coachingProfile ?? null}
      notificationPreferences={notificationPreferences?.preferences ?? null}
    />
  );
}
