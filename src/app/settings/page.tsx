import { SettingsClient } from '@/components/settings/settings-client';
import { getSettingsServer, getCurrentUserServer, getCoachingProfileServer } from '@/api/server';
import { swallowNotFound } from '@/lib/server-data';

export default async function SettingsPage() {
  // 404 = not configured yet → show defaults. 500/network → throw to error.tsx.
  const [settingsData, profileData, coachingProfile] = await Promise.all([
    swallowNotFound(getSettingsServer(), null),
    swallowNotFound(getCurrentUserServer(), null),
    swallowNotFound(getCoachingProfileServer(), null),
  ]);

  return (
    <SettingsClient
      settings={settingsData?.data ?? null}
      profile={profileData?.data ?? null}
      coachingProfile={coachingProfile ?? null}
    />
  );
}
