import { ProfileClient } from '@/components/profile/profile-client';
import { getCurrentUser } from '@/api';

export default async function ProfilePage() {
  const profileData = await getCurrentUser().catch(() => null);

  return <ProfileClient initialProfile={profileData?.data ?? undefined} />;
}
