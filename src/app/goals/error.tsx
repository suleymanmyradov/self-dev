'use client';

import { RouteError } from '@/components/shared/route-error';

export default function GoalsError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Goals"
      title="Failed to load goals"
      message="Could not load your goals. Please try again."
      showHomeLink
    />
  );
}
