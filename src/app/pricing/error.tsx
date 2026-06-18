'use client';

import { RouteError } from '@/components/shared/route-error';

export default function PricingError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Pricing"
      title="Something went wrong"
      message="Failed to load pricing. Please try again."
    />
  );
}
