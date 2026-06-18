'use client';

import { RouteError } from '@/components/shared/route-error';

export default function OnboardingError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Onboarding"
      title="Something went wrong"
      message="Failed to load onboarding. Please try again."
    />
  );
}
