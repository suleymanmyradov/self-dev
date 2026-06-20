import { Suspense } from 'react';
import { HabitsClient } from '@/components/habits/habits-client';
import { listAllHabitsServer, getTodayCheckInsServer } from '@/api/server';
import { HabitsSkeleton } from '@/components/habits/habits-skeleton';

export default async function HabitsPage() {
  const habitsPromise = listAllHabitsServer();
  const checkInsPromise = getTodayCheckInsServer();

  return (
    <Suspense fallback={<HabitsSkeleton />}>
      <HabitsClient
        habitsPromise={habitsPromise}
        checkInsPromise={checkInsPromise}
      />
    </Suspense>
  );
}
