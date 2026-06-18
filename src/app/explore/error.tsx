'use client';

import { RouteError } from '@/components/shared/route-error';

export default function ExploreError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Explore"
      title="Failed to load explore"
      message="Could not load explore content. Please try again."
      showHomeLink
    />
  );
}
