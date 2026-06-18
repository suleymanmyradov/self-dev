import { Suspense } from 'react';
import { GoalsClient } from '@/components/goals/goals-client';
import { listGoalsServer } from '@/api/server';
import { GoalsSkeleton } from '@/components/goals/goals-skeleton';

export default async function GoalsPage() {
  const goalsPromise = listGoalsServer();

  return (
    <Suspense fallback={<GoalsSkeleton />}>
      <GoalsClient goalsPromise={goalsPromise} />
    </Suspense>
  );
}
