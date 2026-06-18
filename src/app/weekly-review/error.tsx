'use client';

import { RouteError } from '@/components/shared/route-error';

export default function WeeklyReviewError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Weekly review"
      title="Something went wrong"
      message="Failed to load weekly review. Please try again."
    />
  );
}
