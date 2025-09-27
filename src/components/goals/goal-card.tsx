"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Goal } from "@/store/goals";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { CalendarDays, CheckCircle2, EllipsisVertical, MessageSquare, HeartHandshake } from "lucide-react";

export type GoalCardProps = {
  goal: Goal;
  onToggle: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
};

export function GoalCard({ goal, onToggle, onEdit, onDelete }: GoalCardProps) {
  const due = goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : undefined;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{goal.category}</Badge>
            {due && (
              <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> {due}
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base font-semibold leading-tight truncate">{goal.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
          <div className="mt-3">
            <Progress value={goal.progress} className="h-2" />
            <div className="mt-1 text-xs text-muted-foreground">{goal.progress}% complete</div>
          </div>
          {goal.relatedHabitIds && goal.relatedHabitIds.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Linked habits: {goal.relatedHabitIds.length}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Link href="/ai-coach" className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
              <MessageSquare className="h-3.5 w-3.5" /> Ask Coach
            </Link>
            <Link href="/ai-therapist" className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
              <HeartHandshake className="h-3.5 w-3.5" /> Ask Therapist
            </Link>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            checked={goal.completed}
            onCheckedChange={() => onToggle(goal.id)}
            className="mt-1"
            aria-label="Toggle completed"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(goal.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
