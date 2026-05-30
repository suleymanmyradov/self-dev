import { Suspense } from 'react';
import { PricingClient } from '@/components/pricing/pricing-client';

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-background" />}>
      <PricingClient />
    </Suspense>
  );
}
