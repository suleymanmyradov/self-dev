import { Suspense } from 'react';
import { ActivityClient } from '@/components/activity/activity-client';
import { listActivitiesServer } from '@/api/server';
import { ActivitySkeleton } from '@/components/activity/activity-skeleton';

export default async function ActivityPage() {
  const activitiesPromise = listActivitiesServer({ page: 1, limit: 50 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 50, totalPages: 0 } }));

  return (
    <Suspense fallback={<ActivitySkeleton />}>
      <ActivityClient activitiesPromise={activitiesPromise} />
    </Suspense>
  );
}
