import { redirect } from 'next/navigation';
import { OnboardingClient } from '@/components/onboarding/onboarding-client';
import { getSettingsServer } from '@/api/server';
import { swallowNotFound } from '@/lib/server-data';

export default async function OnboardingPage() {
  // Block re-entry: if the user already completed onboarding, send them to the
  // app. A 404 means settings don't exist yet — allow onboarding to proceed.
  const settings = await swallowNotFound(getSettingsServer(), null);

  if (settings?.data?.onboardingCompleted) {
    redirect('/plan');
  }

  return <OnboardingClient />;
}
