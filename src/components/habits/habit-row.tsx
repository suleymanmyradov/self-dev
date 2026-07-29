"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckInControl } from "@/components/shared/check-in-control";
import { StreakBar } from "@/components/shared/streak-bar";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Habit } from "@/api";
import { cn } from "@/lib/utils";

/**
 * Compact habit row for the management view (/plan).
 * Shows check-in control, name, streak bar, and an edit/delete menu.
 */
export function HabitRow({
  habit: h,
  onCheckIn,
  onEdit,
  onDelete,
  isPending = false,
}: {
  habit: Habit;
  onCheckIn: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  isPending?: boolean;
}) {
  const streakDays = (h.recentHistory ?? []).slice(-14);

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Check-in control */}
      <CheckInControl
        checked={h.completed}
        onToggle={() => !h.completed && onCheckIn(h)}
        size={22}
        disabled={isPending || h.completed}
        aria-label={`Check in ${h.name}`}
      />

      {/* Name + frequency */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "truncate text-sm font-medium",
          h.completed && "text-success"
        )}>
          {h.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {h.category ? h.category : 'uncategorized'} · daily
        </p>
      </div>

      {/* Streak bar */}
      <div className="hidden sm:block" style={{ width: 150 }}>
        <StreakBar days={streakDays} streak={h.streak} className="gap-1" />
      </div>

      {/* Streak count */}
      <span className="font-mono text-xs tabular-nums shrink-0" style={{ width: 32, textAlign: 'right' }}>
        {h.streak > 0 ? `${h.streak}d` : '—'}
      </span>

      {/* Menu */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="h-7 w-7 shrink-0" aria-label="Open actions menu">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(h)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(h.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
