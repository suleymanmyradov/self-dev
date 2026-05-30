import { HabitsClient } from '@/components/habits/habits-client';
import { listHabits, getTodayCheckIns } from '@/api';

export default async function HabitsPage() {
  const [habitsData, checkInsData] = await Promise.all([
    listHabits({ page: 1, limit: 100 }).catch(() => null),
    getTodayCheckIns().catch(() => null),
  ]);

  return (
    <HabitsClient
      initialHabits={habitsData ?? undefined}
      initialCheckIns={checkInsData ?? undefined}
    />
  );
}
