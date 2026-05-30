import { SettingsClient } from '@/components/settings/settings-client';
import { getSettings, getCurrentUser } from '@/api';

export default async function SettingsPage() {
  const [settingsData, profileData] = await Promise.all([
    getSettings().catch(() => null),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <SettingsClient
      initialSettings={settingsData ?? undefined}
      initialProfile={profileData?.data ?? undefined}
    />
  );
}
