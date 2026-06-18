'use client';

import { RouteError } from '@/components/shared/route-error';

export default function SettingsError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Settings"
      title="Something went wrong"
      message="Failed to load settings. Please try again."
    />
  );
}
