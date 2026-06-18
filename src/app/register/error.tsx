'use client';

import { RouteError } from '@/components/shared/route-error';

export default function RegisterError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Register"
      title="Something went wrong"
      message="Failed to load registration page. Please try again."
    />
  );
}
