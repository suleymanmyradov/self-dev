import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PricingClient } from '@/components/pricing/pricing-client';

export const metadata: Metadata = {
  title: 'Pricing | Growth',
  description: 'Choose the plan that fits your personal development journey.',
};

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-background" />}>
      <PricingClient />
    </Suspense>
  );
}
