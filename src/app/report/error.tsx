'use client';

import { RouteError } from '@/components/shared/route-error';

export default function ReportError(props: React.ComponentProps<typeof RouteError>) {
  return (
    <RouteError
      {...props}
      logLabel="Report"
      title="Something went wrong"
      message="Failed to load report page. Please try again."
    />
  );
}
