"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SplitCheckInControl } from "@/components/shared/split-check-in-control";
import { StreakBar } from "@/components/shared/streak-bar";
import { MoreHorizontal, Pencil, Trash2, StickyNote } from "lucide-react";
import type { Habit } from "@/api";
import { cn } from "@/lib/utils";

/**
 * Compact habit row for the management view (/plan).
 * Shows check-in control, name, streak bar, and an edit/delete menu.
 */
export function HabitRow({
  habit: h,
  onCheckIn,
  onUndoCheckIn,
  onEdit,
  onDelete,
  onLogDetails,
  hasNote = false,
  isPending = false,
  isUndoPending = false,
}: {
  habit: Habit;
  onCheckIn: (habit: Habit) => void;
  onUndoCheckIn?: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onLogDetails?: (habit: Habit) => void;
  /** Whether today's check-in for this habit has a note attached. */
  hasNote?: boolean;
  isPending?: boolean;
  isUndoPending?: boolean;
}) {
  const streakDays = (h.recentHistory ?? []).slice(-14);

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Check-in control — split: left = fast one-tap check-in / undo,
          right = open the detailed check-in modal (mood / energy / note) */}
      <SplitCheckInControl
        checked={h.completed}
        onCheckIn={() => {
          if (h.completed) {
            onUndoCheckIn?.(h);
          } else {
            onCheckIn(h);
          }
        }}
        onLogDetails={() => onLogDetails?.(h)}
        disabled={isPending || isUndoPending || (h.completed && !onUndoCheckIn)}
        hideDetails={!onLogDetails}
        aria-label={h.name}
      />

      {/* Name + frequency */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={cn(
            "truncate text-sm font-medium",
            h.completed && "text-success"
          )}>
            {h.name}
          </p>
          {hasNote && (
            <StickyNote
              className="h-3 w-3 shrink-0 text-muted-foreground"
              aria-label="Has a note"
            />
          )}
        </div>
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
