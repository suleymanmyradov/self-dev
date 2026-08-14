"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, CheckCircle2, CheckSquare, Square, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitRow } from "@/components/habits/habit-row";
import type { Habit, Goal } from "@/api";

interface GoalCardProps {
  goal: Goal;
  habits: Habit[];
  visibleHabits: Habit[];
  isCheckInPending?: boolean;
  isUndoPending?: boolean;
  onCheckIn: (habit: Habit) => void;
  onUndoCheckIn?: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onLogDetails?: (habit: Habit) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onToggleGoal: (id: string) => void;
  onAddHabit: () => void;
  onToggleMilestone?: (milestoneId: string) => void;
  onAddMilestone?: (title: string) => void;
  onDeleteMilestone?: (milestoneId: string) => void;
  onLogValue?: (value: number) => void;
}

export function GoalCard({
  goal,
  habits,
  visibleHabits,
  isCheckInPending = false,
  isUndoPending = false,
  onCheckIn,
  onUndoCheckIn,
  onEditHabit,
  onDeleteHabit,
  onLogDetails,
  onEditGoal,
  onDeleteGoal,
  onToggleGoal,
  onAddHabit,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  onLogValue,
}: GoalCardProps) {
  const isCompleted = goal.completed || goal.progress >= 100;
  const measurement = goal.measurement ?? "manual";
  const milestones = goal.milestones ?? [];
  const showHabitSection = measurement === "habit" || measurement === "manual";
  const showAddHabitCta = showHabitSection;
  const [newMilestone, setNewMilestone] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [isLoggingValue, setIsLoggingValue] = useState(false);

  const handleAddMilestone = () => {
    const title = newMilestone.trim();
    if (!title) return;
    onAddMilestone?.(title);
    setNewMilestone("");
    setIsAddingMilestone(false);
  };

  const handleLogValue = () => {
    const value = Number(newValue);
    if (isNaN(value)) return;
    onLogValue?.(value);
    setNewValue("");
    setIsLoggingValue(false);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-[background-color,box-shadow]",
        isCompleted && "ring-1 ring-success/30"
      )}
    >
      {/* Goal header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="font-display text-lg sm:text-xl font-semibold leading-tight truncate">
              {goal.title}
            </h2>
            <Badge variant="outline" className="capitalize shrink-0">
              {goal.category}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed break-words" style={{ maxWidth: '62ch' }}>
            {goal.description}
          </p>
          {goal.dueDate && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Due {new Date(goal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Goal progress (right side) + actions — type-driven */}
        <div className="flex items-center gap-2 sm:items-start sm:justify-end">
          <div className="flex flex-col items-end gap-1 w-28 sm:w-40">
            {measurement === "binary" ? (
              <Badge variant={isCompleted ? "default" : "outline"} className="capitalize">
                {isCompleted ? "Done" : "Not done"}
              </Badge>
            ) : measurement === "numeric" ? (
              <>
                <span className="font-mono text-sm tabular-nums">
                  {goal.currentValue ?? 0} / {goal.targetValue ?? 0}
                  {goal.unit ? ` ${goal.unit}` : ""}
                </span>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success transition-[width] duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <span className="font-mono text-lg tabular-nums">{goal.progress}%</span>
                {showHabitSection && habits.length > 0 && (() => {
                  const done = habits.filter((h) => h.completed).length;
                  const pct = Math.round((done / habits.length) * 100);
                  return (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {done} / {habits.length} today · {pct}%
                    </span>
                  );
                })()}
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success transition-[width] duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </>
            )}
          </div>
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleGoal(goal.id)}
            className="shrink-0 gap-1.5"
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? 'Done' : 'Active'}
          </Button>
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

      {/* Milestone checklist for milestone-type goals */}
      {measurement === "milestone" && (
        <div className="mt-4 grid gap-1.5 border-t border-border pt-4">
          {milestones.length > 0 ? (
            milestones.map((m) => {
              const done = !!m.doneAt;
              return (
                <div key={m.id} className="group flex items-center gap-2.5 rounded-lg py-1.5 text-sm">
                  <button
                    type="button"
                    onClick={() => onToggleMilestone?.(m.id)}
                    className="flex flex-1 items-center gap-2.5 text-left transition-colors hover:text-foreground"
                  >
                    {done ? (
                      <CheckSquare className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn("truncate", done && "text-muted-foreground line-through")}>
                      {m.title}
                    </span>
                  </button>
                  {onDeleteMilestone && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${m.title}"?`)) {
                          onDeleteMilestone(m.id);
                        }
                      }}
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label="Delete milestone"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="py-1 text-xs text-muted-foreground">No steps yet — add one below.</p>
          )}

          {/* Add milestone inline */}
          {onAddMilestone && (
            isAddingMilestone ? (
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleAddMilestone(); }
                    if (e.key === "Escape") { setNewMilestone(""); setIsAddingMilestone(false); }
                  }}
                  placeholder="Step title"
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button type="button" size="sm" variant="default" onClick={handleAddMilestone} disabled={!newMilestone.trim()}>
                  Add
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { setNewMilestone(""); setIsAddingMilestone(false); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingMilestone(true)}
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/40">
                  <Plus className="h-3 w-3" />
                </span>
                Add a step
              </button>
            )
          )}
        </div>
      )}

      {/* Log value for numeric goals */}
      {measurement === "numeric" && onLogValue && (
        <div className="mt-4 border-t border-border pt-4">
          {isLoggingValue ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleLogValue(); }
                  if (e.key === "Escape") { setNewValue(""); setIsLoggingValue(false); }
                }}
                placeholder={`New value${goal.unit ? ` (${goal.unit})` : ""}`}
                className="h-8 text-sm"
                autoFocus
              />
              <Button type="button" size="sm" variant="default" onClick={handleLogValue} disabled={!newValue || isNaN(Number(newValue))}>
                Log
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setNewValue(""); setIsLoggingValue(false); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoggingValue(true)}
              className="flex w-full items-center gap-2.5 rounded-lg py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/40">
                <Plus className="h-3 w-3" />
              </span>
              Log new value
            </button>
          )}
        </div>
      )}

      {/* Nested habit rows — only for habit and manual types */}
      {showHabitSection && visibleHabits.length > 0 && (
        <div className="mt-4 divide-y divide-border border-t border-border">
          {visibleHabits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              onCheckIn={onCheckIn}
              onUndoCheckIn={onUndoCheckIn}
              onEdit={onEditHabit}
              onDelete={onDeleteHabit}
              onLogDetails={onLogDetails}
              isPending={isCheckInPending}
              isUndoPending={isUndoPending}
            />
          ))}
        </div>
      )}

      {/* Add a habit to this goal — only for habit and manual types */}
      {showAddHabitCta && (
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
      )}
    </div>
  );
}
