import { Suspense } from 'react';
import { GoalsClient } from '@/components/goals/goals-client';
import { listGoalsServer } from '@/api/server';
import { GoalsSkeleton } from '@/components/goals/goals-skeleton';

export default async function GoalsPage() {
  const goalsPromise = listGoalsServer().catch(() => ({ data: [], page: { total: 0, page: 1, limit: 20, totalPages: 0 } }));

  return (
    <Suspense fallback={<GoalsSkeleton />}>
      <GoalsClient goalsPromise={goalsPromise} />
    </Suspense>
  );
}
