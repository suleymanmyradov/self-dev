import { ActivityClient } from '@/components/activity/activity-client';
import { listActivities } from '@/api';

export default async function ActivityPage() {
  const activitiesData = await listActivities({ page: 1, limit: 50 }).catch(() => null);

  return <ActivityClient initialActivities={activitiesData ?? undefined} />;
}
