import { Suspense } from 'react';
import { HabitsClient } from '@/components/habits/habits-client';
import { listAllHabitsServer, listGoalsServer } from '@/api/server';
import { HabitsSkeleton } from '@/components/habits/habits-skeleton';

export default async function PlanPage() {
  const habitsPromise = listAllHabitsServer();
  const goalsPromise = listGoalsServer({ page: 1, limit: 100 });

  return (
    <Suspense fallback={<HabitsSkeleton />}>
      <HabitsClient
        habitsPromise={habitsPromise}
        goalsPromise={goalsPromise}
      />
    </Suspense>
  );
}
