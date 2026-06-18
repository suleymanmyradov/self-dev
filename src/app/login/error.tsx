'use client';

import { RouteError } from '@/components/shared/route-error';

export default function LoginError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Login"
      title="Something went wrong"
      message="Failed to load login page. Please try again."
    />
  );
}
