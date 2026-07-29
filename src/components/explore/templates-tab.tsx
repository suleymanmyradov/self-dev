"use client";

import { HabitTemplateCard, GoalTemplateCard } from "@/components/explore";
import type { CreateHabitRequest, CreateGoalRequest } from "@/api";
import type { HabitTemplate, GoalTemplate } from "@/types/explore";

interface TemplatesTabProps {
  habitTemplates: HabitTemplate[];
  goalTemplates: GoalTemplate[];
  onCreateHabit: (data: CreateHabitRequest) => void;
  onCreateGoal: (data: CreateGoalRequest) => void;
}

export function TemplatesTab({
  habitTemplates,
  goalTemplates,
  onCreateHabit,
  onCreateGoal,
}: TemplatesTabProps) {
  return (
    <>
      <div>
        <h3 className="mb-4 font-display text-lg font-normal text-foreground">Habit templates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {habitTemplates.map((habit) => (
            <HabitTemplateCard
              key={habit.name}
              template={habit}
              onAdd={(data) => onCreateHabit(data)}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 font-display text-lg font-normal text-foreground">Goal templates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {goalTemplates.map((goal) => (
            <GoalTemplateCard
              key={goal.title}
              template={goal}
              onAdd={(data) => onCreateGoal(data)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
