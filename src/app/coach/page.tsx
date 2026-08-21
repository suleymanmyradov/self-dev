import { AssistantLoader } from '@/components/ai-coach/assistant-loader';

type CoachSearchParams = Promise<{
  goalId?: string | string[];
  goalTitle?: string | string[];
}>;

export default async function AICoachPage({ searchParams }: { searchParams: CoachSearchParams }) {
  const params = await searchParams;
  const goalId = typeof params.goalId === 'string' ? params.goalId : undefined;
  const goalTitle = typeof params.goalTitle === 'string' ? params.goalTitle : undefined;

  return <AssistantLoader initialGoalId={goalId} initialGoalTitle={goalTitle} />;
}
