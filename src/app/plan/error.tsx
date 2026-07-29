'use client';

import { RouteError } from '@/components/shared/route-error';

export default function HabitsError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Habits"
      title="Failed to load habits"
      message="Could not load your habits. Please try again."
      showHomeLink
    />
  );
}
