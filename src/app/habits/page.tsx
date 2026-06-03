import { Suspense } from 'react';
import { HabitsClient } from '@/components/habits/habits-client';
import { listHabitsServer, getTodayCheckInsServer } from '@/api/server';
import { HabitsSkeleton } from '@/components/habits/habits-skeleton';

export default async function HabitsPage() {
  const habitsPromise = listHabitsServer({ page: 1, limit: 100 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 100, totalPages: 0 } }));
  const checkInsPromise = getTodayCheckInsServer().catch(() => ({ data: [], page: { total: 0, page: 1, limit: 20, totalPages: 0 } }));

  return (
    <Suspense fallback={<HabitsSkeleton />}>
      <HabitsClient
        habitsPromise={habitsPromise}
        checkInsPromise={checkInsPromise}
      />
    </Suspense>
  );
}
