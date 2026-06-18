'use client';

import { RouteError } from '@/components/shared/route-error';

export default function CommunityError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Community"
      title="Something went wrong"
      message="Failed to load community page. Please try again."
    />
  );
}
