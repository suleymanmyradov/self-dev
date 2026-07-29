'use client';

import type { Goal } from '@/api';

interface GoalsSectionProps {
  goals: Goal[];
}

export function GoalsSection({ goals }: GoalsSectionProps) {
  const activeGoal = goals.find((g) => !g.completed);
  const goalHabitCount = activeGoal?.relatedHabitIds?.length ?? 0;

  if (!activeGoal) return null;

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <p className="font-mono text-[0.65rem] tracking-widest text-muted-foreground mb-2">
        GOAL IN FOCUS
      </p>
      <h3 className="font-display text-lg leading-snug text-foreground">
        {activeGoal.title}
      </h3>
      <div className="flex items-baseline justify-between mt-3 mb-2">
        <span className="font-mono text-sm font-medium tabular-nums text-foreground">
          {Math.round(activeGoal.progress)}%
        </span>
        <span className="text-xs text-muted-foreground">
          {goalHabitCount} habit{goalHabitCount === 1 ? '' : 's'} feed this goal
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-[width] duration-300"
          style={{ width: `${Math.min(100, activeGoal.progress)}%` }}
        />
      </div>
    </div>
  );
}
