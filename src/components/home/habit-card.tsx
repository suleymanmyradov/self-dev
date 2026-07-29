"use client";

import { CheckInControl } from "@/components/shared/check-in-control";
import { StreakBar } from "@/components/shared/streak-bar";
import type { Habit } from "@/api";
import { cn } from "@/lib/utils";

/**
 * Card-styled habit row for the dashboard (/).
 * Shows check-in control, name, streak bar, and a pending indicator.
 * No edit/delete menu — the dashboard is read-only for habits.
 */
export function HabitCard({
  habit,
  completed,
  onCheckIn,
  pending,
}: {
  habit: Habit;
  completed: boolean;
  onCheckIn?: () => void;
  pending?: boolean;
}) {
  const history = habit.recentHistory ?? [];
  // Pad to 14 days (oldest first) for the StreakBar
  const padded: boolean[] = [...history];
  while (padded.length < 14) padded.unshift(false);
  const last14 = padded.slice(-14);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-[background-color] duration-200',
        completed && 'bg-success-soft/30',
      )}
    >
      <CheckInControl
        checked={completed}
        onToggle={onCheckIn ?? (() => {})}
        disabled={completed || pending}
        aria-label={completed ? `${habit.name} done` : `Check in ${habit.name}`}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{habit.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {habit.category || 'Habit'}
          {completed && <>{' · '}done today</>}
        </p>
      </div>

      <div className="hidden sm:block w-[168px] shrink-0">
        <StreakBar days={last14} streak={habit.streak} />
      </div>

      <div className="shrink-0 text-right w-10">
        <span className="font-mono text-sm tabular-nums text-foreground">
          {habit.streak > 0 ? `${habit.streak}d` : '—'}
        </span>
      </div>

      {pending && (
        <span className="shrink-0 text-xs text-muted-foreground animate-pulse">…</span>
      )}
    </div>
  );
}
