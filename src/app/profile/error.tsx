'use client';

import { RouteError } from '@/components/shared/route-error';

export default function ProfileError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Profile"
      title="Something went wrong"
      message="Failed to load profile. Please try again."
    />
  );
}
