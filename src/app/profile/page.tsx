import { ProfileClient } from '@/components/profile/profile-client';
import { getCurrentUser } from '@/api';
import { notFound } from 'next/navigation';

export default async function ProfilePage() {
  const profileData = await getCurrentUser().catch(() => null);
  const profile = profileData?.data;

  if (!profile) {
    notFound();
  }

  return <ProfileClient profile={profile} />;
}
