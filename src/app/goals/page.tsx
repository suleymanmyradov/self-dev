import { GoalsClient } from '@/components/goals/goals-client';
import { listGoals } from '@/api';

export default async function GoalsPage() {
  const goalsData = await listGoals().catch(() => null);

  return <GoalsClient initialGoals={goalsData ?? undefined} />;
}
