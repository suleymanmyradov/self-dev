'use client';

import { RouteError } from '@/components/shared/route-error';

export default function SavedError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Saved items"
      title="Something went wrong"
      message="Failed to load saved items. Please try again."
    />
  );
}
