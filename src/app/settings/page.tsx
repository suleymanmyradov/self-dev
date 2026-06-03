import { SettingsClient } from '@/components/settings/settings-client';
import { getSettings, getCurrentUser } from '@/api';
import { getCoachingProfile } from '@/api/personalization';

export default async function SettingsPage() {
  const [settingsData, profileData, coachingProfile] = await Promise.all([
    getSettings().catch(() => null),
    getCurrentUser().catch(() => null),
    getCoachingProfile().catch(() => null),
  ]);

  return (
    <SettingsClient
      settings={settingsData?.data ?? null}
      profile={profileData?.data ?? null}
      coachingProfile={coachingProfile ?? null}
    />
  );
}
