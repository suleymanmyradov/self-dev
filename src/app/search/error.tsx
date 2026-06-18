'use client';

import { RouteError } from '@/components/shared/route-error';

export default function SearchError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Search"
      title="Something went wrong"
      message="Search failed. Please try again."
    />
  );
}
