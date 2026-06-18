'use client';

import { RouteError } from '@/components/shared/route-error';

export default function AppearanceError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Appearance"
      title="Something went wrong"
      message="Failed to load appearance settings. Please try again."
    />
  );
}
