import { ProfileClient } from '@/components/profile/profile-client';
import { getCurrentUserServer } from '@/api/server';
import { notFound } from 'next/navigation';

export default async function ProfilePage() {
  const profileData = await getCurrentUserServer().catch(() => null);
  const profile = profileData?.data;

  if (!profile) {
    notFound();
  }

  return <ProfileClient profile={profile} />;
}
