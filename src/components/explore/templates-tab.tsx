"use client";

import { HabitTemplateCard, GoalTemplateCard } from "@/components/explore";
import type { CreateHabitRequest, CreateGoalRequest } from "@/api";
import type { HabitTemplate, GoalTemplate } from "@/types/explore";

interface TemplatesTabProps {
  habitTemplates: HabitTemplate[];
  goalTemplates: GoalTemplate[];
  onCreateHabit: (data: CreateHabitRequest) => void;
  onCreateGoal: (data: CreateGoalRequest) => void;
  creatingHabitName?: string;
  creatingGoalTitle?: string;
}

export function TemplatesTab({
  habitTemplates,
  goalTemplates,
  onCreateHabit,
  onCreateGoal,
  creatingHabitName,
  creatingGoalTitle,
}: TemplatesTabProps) {
  return (
    <>
      <div>
        <h3 className="mb-4 font-display text-lg font-normal text-foreground">Habit templates</h3>
        {habitTemplates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No habit templates are available yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {habitTemplates.map((habit) => (
              <HabitTemplateCard
                key={`${habit.name}-${habit.category}`}
                template={habit}
                onAdd={(data) => onCreateHabit(data)}
                isAdding={creatingHabitName === habit.name}
              />
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-4 font-display text-lg font-normal text-foreground">Goal templates</h3>
        {goalTemplates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No goal templates are available yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goalTemplates.map((goal) => (
              <GoalTemplateCard
                key={`${goal.title}-${goal.category}`}
                template={goal}
                onAdd={(data) => onCreateGoal(data)}
                isAdding={creatingGoalTitle === goal.title}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
