'use client';

import { RouteError } from '@/components/shared/route-error';

export default function AICoachError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="AI Coach"
      title="Chat error"
      message="Something went wrong with the AI chat. Please try again."
      showHomeLink
    />
  );
}
