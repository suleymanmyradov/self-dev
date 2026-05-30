import { GoalsClient } from '@/components/goals/goals-client';
import { listGoals } from '@/api';

export default async function GoalsPage() {
  try {
    const goalsData = await listGoals();
    return <GoalsClient initialGoals={goalsData ?? undefined} />;
  } catch (error) {
    console.error('[GoalsPage] Failed to fetch goals:', error);
    return <GoalsClient initialGoals={undefined} />;
  }
}
