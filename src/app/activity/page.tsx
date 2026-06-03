import { Suspense } from 'react';
import { ActivityClient } from '@/components/activity/activity-client';
import { listActivities } from '@/api';
import { ActivitySkeleton } from '@/components/activity/activity-skeleton';

export default async function ActivityPage() {
  const activitiesPromise = listActivities({ page: 1, limit: 50 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 50, totalPages: 0 } }));

  return (
    <Suspense fallback={<ActivitySkeleton />}>
      <ActivityClient activitiesPromise={activitiesPromise} />
    </Suspense>
  );
}
