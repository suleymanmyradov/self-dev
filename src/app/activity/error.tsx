'use client';

import { RouteError } from '@/components/shared/route-error';

export default function ActivityError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Activity"
      title="Failed to load activity"
      message="Could not load your activity. Please try again."
      showHomeLink
    />
  );
}
