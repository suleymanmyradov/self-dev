'use client';

import type { Goal, GoalMeasurement } from '@/api';

interface GoalsSectionProps {
  goals: Goal[];
}

/**
 * Compact subtitle + progress bar for the home-page "Goal in focus" card.
 * Mirrors the measurement-type logic in GoalCard (plan page) but in a
 * one-line summary form.
 */
function getGoalSummary(goal: Goal): { left: string; right: string; showBar: boolean } {
  const measurement: GoalMeasurement = goal.measurement ?? 'manual';

  switch (measurement) {
    case 'binary': {
      const done = goal.completed || goal.progress >= 100;
      return {
        left: done ? 'Done' : 'Not done',
        right: goal.dueDate ? `Due ${new Date(goal.dueDate).toLocaleDateString()}` : 'Binary goal',
        showBar: false,
      };
    }
    case 'numeric': {
      const current = goal.currentValue ?? 0;
      const target = goal.targetValue ?? 0;
      const unit = goal.unit ? ` ${goal.unit}` : '';
      return {
        left: `${current} / ${target}${unit}`,
        right: `${Math.round(goal.progress)}%`,
        showBar: true,
      };
    }
    case 'milestone': {
      const milestones = goal.milestones ?? [];
      const doneCount = milestones.filter((m) => !!m.doneAt).length;
      const total = milestones.length;
      return {
        left: `${doneCount} / ${total} step${total === 1 ? '' : 's'}`,
        right: `${Math.round(goal.progress)}%`,
        showBar: true,
      };
    }
    case 'habit':
    case 'manual':
    default: {
      const habitCount = goal.relatedHabitIds?.length ?? 0;
      return {
        left: `${Math.round(goal.progress)}%`,
        right: habitCount > 0
          ? `${habitCount} habit${habitCount === 1 ? '' : 's'} feed this goal`
          : 'No habits linked yet',
        showBar: true,
      };
    }
  }
}

export function GoalsSection({ goals }: GoalsSectionProps) {
  const activeGoal = goals.find((g) => !g.completed);

  if (!activeGoal) return null;

  const { left, right, showBar } = getGoalSummary(activeGoal);

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
          {left}
        </span>
        <span className="text-xs text-muted-foreground">{right}</span>
      </div>
      {showBar && (
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-[width] duration-300"
            style={{ width: `${Math.min(100, activeGoal.progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}
