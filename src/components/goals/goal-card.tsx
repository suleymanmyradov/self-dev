"use client";

import { memo, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Goal, Habit } from "@/api";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import { CalendarDays, CheckCircle2, MoreHorizontal, MessageSquare, Target, Sparkles, Link2, Flame } from "lucide-react";

export type GoalCardProps = {
  goal: Goal;
  onToggle: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onProgressChange?: (id: string, progress: number) => void;
  deleting?: boolean;
  habits?: Habit[];
};

const MAX_INLINE_HABITS = 2;

export const GoalCard = memo(function GoalCard({ goal, onToggle, onEdit, onDelete, onProgressChange, deleting, habits = [] }: GoalCardProps) {
  const [habitsOpen, setHabitsOpen] = useState(false);
  const due = goal.dueDate
    ? new Date(goal.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;
  const categoryStyle = CATEGORY_COLORS[goal.category] || "bg-secondary text-secondary-foreground border-border";
  const isNearCompletion = goal.progress >= 75 && goal.progress < 100;
  const isCompleted = goal.completed || goal.progress >= 100;

  // Resolve linked habit IDs to habit objects.
  const linkedHabits = useMemo(() => {
    const ids = goal.relatedHabitIds ?? [];
    if (ids.length === 0) return [];
    const byId = new Map(habits.map((h) => [h.id, h]));
    return ids
      .map((id) => byId.get(id))
      .filter((h): h is Habit => h !== undefined);
  }, [goal.relatedHabitIds, habits]);
  const inlineHabits = linkedHabits.slice(0, MAX_INLINE_HABITS);
  const remainingCount = linkedHabits.length - inlineHabits.length;

  return (
    <Card
      data-deleting={deleting || undefined}
      className={cn(
        "p-5 transition-all duration-300 hover-lift",
        isCompleted && "ring-1 ring-growth/30 bg-growth-soft/20",
        "data-[deleting=true]:opacity-0 data-[deleting=true]:-translate-y-2 data-[deleting=true]:scale-[0.98]"
      )}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Progress indicator */}
        <div className={cn(
          "flex flex-col items-center justify-center rounded-xl p-3 min-w-[60px]",
          isCompleted ? "bg-growth text-growth-foreground" : "bg-muted"
        )}>
          <Target className={cn("h-5 w-5", isCompleted ? "text-growth-foreground" : "text-muted-foreground")} />
          <span className={cn(
            "mt-1 text-lg font-bold tabular-nums",
            isCompleted ? "text-growth-foreground" : "text-foreground"
          )}>
            {goal.progress}%
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("capitalize border", categoryStyle)}>
              {goal.category}
            </Badge>
            {due && (
              <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> {due}
              </span>
            )}
            {isNearCompletion && (
              <span className="inline-flex items-center gap-1 text-xs text-energy">
                <Sparkles className="h-3 w-3" /> Almost there!
              </span>
            )}
          </div>
          
          <h3 className={cn(
            "mt-1 text-base font-semibold leading-tight truncate",
            isCompleted && "text-growth"
          )}>
            {goal.title}
          </h3>
          
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {goal.description}
          </p>

          {/* Progress bar */}
          <div className="mt-3">
            <Progress 
              value={goal.progress} 
              className={cn(
                "h-1.5 bg-muted",
                isCompleted && "[&>div]:bg-growth",
                isNearCompletion && "[&>div]:bg-energy"
              )}
            />
            {onProgressChange && !isCompleted && (
              <div className="mt-2 flex gap-1">
                {[25, 50, 75].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => onProgressChange(goal.id, preset)}
                    aria-label={`Set progress to ${preset}%`}
                    className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors min-h-[2rem]"
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Linked habits */}
          {linkedHabits.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Linked habits
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {inlineHabits.map((h) => (
                  <span
                    key={h.id}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                  >
                    <Flame className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[140px]">{h.name}</span>
                  </span>
                ))}
                {remainingCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground"
                    onClick={() => setHabitsOpen(true)}
                  >
                    +{remainingCount} more
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-3 flex items-center gap-3 text-xs">
            <Link 
              href="/ai-coach" 
              className="inline-flex items-center gap-1.5 rounded-lg bg-calm-soft px-2.5 py-1 text-calm transition-colors hover:bg-calm hover:text-calm-foreground"
            >
              <MessageSquare className="h-3 w-3" /> Ask coach
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-start gap-2">
          <Checkbox
            checked={goal.completed}
            onCheckedChange={() => onToggle(goal.id)}
            className={cn(
              "mt-1 transition-colors",
              isCompleted && "border-growth bg-growth text-growth-foreground"
            )}
            aria-label="Toggle completed"
          />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Open actions menu">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(goal.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Linked habits dialog */}
      <Dialog open={habitsOpen} onOpenChange={setHabitsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Linked habits — {goal.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <ul className="space-y-1.5">
              {linkedHabits.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start gap-2.5 rounded-lg border border-border p-2.5"
                >
                  <div className={cn(
                    "flex flex-col items-center justify-center rounded-lg p-1.5 shrink-0",
                    h.completed ? "bg-growth text-growth-foreground" : "bg-muted"
                  )}>
                    <Flame className={cn("h-3.5 w-3.5", h.completed ? "text-growth-foreground" : "text-muted-foreground")} />
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      h.completed ? "text-growth-foreground" : "text-muted-foreground"
                    )}>
                      {h.streak}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{h.name}</p>
                    {h.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {h.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});
