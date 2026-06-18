import { ProfileClient } from '@/components/profile/profile-client';
import { getCurrentUserServer } from '@/api/server';
import { notFound } from 'next/navigation';
import { swallowNotFound } from '@/lib/server-data';

export default async function ProfilePage() {
  // 404 → notFound() page. 500/network → throw to error.tsx.
  const profileData = await swallowNotFound(getCurrentUserServer(), null);
  const profile = profileData?.data;

  if (!profile) {
    notFound();
  }

  return <ProfileClient profile={profile} />;
}
