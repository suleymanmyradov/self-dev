import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PricingClient } from '@/components/pricing/pricing-client';
import { getBillingOverviewServer } from '@/api/server';
import { PricingSkeleton } from '@/components/pricing/pricing-skeleton';

export const metadata: Metadata = {
  title: 'Pricing | Growth',
  description: 'Choose the plan that fits your personal development journey.',
};

export default async function PricingPage() {
  const billingInitialData = await getBillingOverviewServer();

  return (
    <Suspense fallback={<PricingSkeleton />}>
      <PricingClient billingInitialData={billingInitialData ?? undefined} />
    </Suspense>
  );
}
