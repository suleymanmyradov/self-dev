import { SettingsClient } from '@/components/settings/settings-client';
import { getSettingsServer, getCurrentUserServer, getCoachingProfileServer } from '@/api/server';

export default async function SettingsPage() {
  const [settingsData, profileData, coachingProfile] = await Promise.all([
    getSettingsServer().catch(() => null),
    getCurrentUserServer().catch(() => null),
    getCoachingProfileServer().catch(() => null),
  ]);

  return (
    <SettingsClient
      settings={settingsData?.data ?? null}
      profile={profileData?.data ?? null}
      coachingProfile={coachingProfile ?? null}
    />
  );
}
