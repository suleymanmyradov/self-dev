'use client';

import { RouteError } from '@/components/shared/route-error';

export default function LogoutError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Logout"
      title="Something went wrong"
      message="Failed to load logout page. Please try again."
    />
  );
}
