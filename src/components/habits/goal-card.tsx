"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitRow } from "@/components/habits/habit-row";
import type { Habit, Goal } from "@/api";

interface GoalCardProps {
  goal: Goal;
  habits: Habit[];
  visibleHabits: Habit[];
  isCheckInPending?: boolean;
  onCheckIn: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onToggleGoal: (id: string) => void;
  onAddHabit: () => void;
}

export function GoalCard({
  goal,
  habits,
  visibleHabits,
  isCheckInPending = false,
  onCheckIn,
  onEditHabit,
  onDeleteHabit,
  onEditGoal,
  onDeleteGoal,
  onToggleGoal,
  onAddHabit,
}: GoalCardProps) {
  const isCompleted = goal.completed || goal.progress >= 100;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-[background-color,box-shadow]",
        isCompleted && "ring-1 ring-success/30"
      )}
    >
      {/* Goal header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold leading-tight truncate">
              {goal.title}
            </h2>
            <Badge variant="outline" className="capitalize shrink-0">
              {goal.category}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed" style={{ maxWidth: '62ch' }}>
            {goal.description}
          </p>
        </div>

        {/* Goal progress (right side) + actions */}
        <div className="flex items-start gap-2 shrink-0">
          <div className="flex flex-col items-end gap-1" style={{ width: 160 }}>
            <span className="font-mono text-lg tabular-nums">{goal.progress}%</span>
            <span className="text-xs text-muted-foreground">
              {habits.filter((h) => h.completed).length} / {habits.length} today
            </span>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-[width] duration-300"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 shrink-0" aria-label="Open goal actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleGoal(goal.id)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> {isCompleted ? 'Mark incomplete' : 'Mark complete'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditGoal(goal)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleteGoal(goal.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Nested habit rows */}
      {visibleHabits.length > 0 && (
        <div className="mt-4 divide-y divide-border border-t border-border">
          {visibleHabits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              onCheckIn={onCheckIn}
              onEdit={onEditHabit}
              onDelete={onDeleteHabit}
              isPending={isCheckInPending}
            />
          ))}
        </div>
      )}

      {/* Add a habit to this goal */}
      <button
        type="button"
        onClick={onAddHabit}
        className="mt-3 flex w-full items-center gap-2.5 rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/40">
          <Plus className="h-3.5 w-3.5" />
        </span>
        Add a habit to this goal
      </button>
    </div>
  );
}
