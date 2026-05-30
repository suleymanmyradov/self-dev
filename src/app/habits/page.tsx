import { HabitsClient } from '@/components/habits/habits-client';
import { listHabits, getTodayCheckIns } from '@/api';

export default async function HabitsPage() {
  try {
    const [habitsData, checkInsData] = await Promise.all([
      listHabits({ page: 1, limit: 100 }),
      getTodayCheckIns(),
    ]);

    return (
      <HabitsClient
        initialHabits={habitsData ?? undefined}
        initialCheckIns={checkInsData ?? undefined}
      />
    );
  } catch (error) {
    console.error('[HabitsPage] Failed to fetch habits or check-ins:', error);
    return (
      <HabitsClient
        initialHabits={undefined}
        initialCheckIns={undefined}
      />
    );
  }
}
