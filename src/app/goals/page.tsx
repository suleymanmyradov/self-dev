import { Suspense } from 'react';
import { GoalsClient } from '@/components/goals/goals-client';
import { listGoals } from '@/api';
import { GoalsSkeleton } from '@/components/goals/goals-skeleton';

export default async function GoalsPage() {
  const goalsPromise = listGoals().catch(() => ({ data: [], page: { total: 0, page: 1, limit: 20, totalPages: 0 } }));

  return (
    <Suspense fallback={<GoalsSkeleton />}>
      <GoalsClient goalsPromise={goalsPromise} />
    </Suspense>
  );
}
