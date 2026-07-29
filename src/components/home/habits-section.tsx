'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HabitCard } from '@/components/home/habit-card';
import type { Habit } from '@/api';

interface HabitsSectionProps {
  habits: Habit[];
  pendingHabits: Habit[];
  completedHabits: Habit[];
  onCheckIn: (habit: Habit) => void;
  onCheckInAll: () => void;
  isCheckInPendingFor: (habitId: string) => boolean;
  isCheckInAllPending: boolean;
}

export function HabitsSection({
  habits,
  pendingHabits,
  completedHabits,
  onCheckIn,
  onCheckInAll,
  isCheckInPendingFor,
  isCheckInAllPending,
}: HabitsSectionProps) {
  const [showDoneEarlier, setShowDoneEarlier] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-xs text-foreground tracking-wide">Today</h2>
        {pendingHabits.length > 0 && (
          <button
            type="button"
            onClick={onCheckInAll}
            disabled={isCheckInAllPending}
            className="text-success text-xs font-medium hover:underline disabled:opacity-50 transition-opacity"
          >
            Check in all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {pendingHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            completed={false}
            onCheckIn={() => onCheckIn(habit)}
            pending={isCheckInPendingFor(habit.id)}
          />
        ))}

        {completedHabits.length > 0 && (
          <>
            {showDoneEarlier ? (
              completedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completed
                />
              ))
            ) : (
              <button
                type="button"
                onClick={() => setShowDoneEarlier(true)}
                className="w-full text-left text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {completedHabits.map((h) => h.name).join(' · ')} —{' '}
                <span className="text-success font-medium">done earlier</span>{' '}
                <span className="underline">Show</span>
              </button>
            )}
          </>
        )}

        {habits.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No habits yet.</p>
            <Link href="/plan" className="text-success text-sm font-medium hover:underline mt-2 inline-block">
              Add your first habit
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
