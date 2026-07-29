import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCOUNTABILITY_STYLE_LABELS } from '@/lib/constants';
import type { OnboardingData } from '@/store/onboarding';

export function HabitSummaryStep({
  state,
  loadingHabits,
  error,
  toggleHabitSelection,
}: {
  state: OnboardingData;
  loadingHabits: boolean;
  error: string | null;
  toggleHabitSelection: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-success" />
          <h2 className="font-display text-2xl">
            Here&apos;s the smallest version that works.
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          I&apos;ve suggested 3 daily habits to get you started. Uncheck any you don&apos;t want.
        </p>
      </div>

      {loadingHabits ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Building your habit plan...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {state.habitSuggestions.map((habit, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleHabitSelection(idx)}
              className={cn(
                'w-full rounded-xl border p-4 text-left transition-[color,background-color,border-color]',
                habit.selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card opacity-60'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    habit.selected
                      ? 'border-background bg-background text-foreground'
                      : 'border-muted-foreground/40'
                  )}
                  aria-hidden="true"
                >
                  {habit.selected && <Check className="h-3 w-3" aria-hidden="true" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{habit.name}</p>
                  <p className={cn(
                    'text-xs mt-0.5',
                    habit.selected ? 'text-background/70' : 'text-muted-foreground'
                  )}>
                    {habit.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Summary card */}
      <div className="rounded-lg bg-secondary/50 p-4 space-y-1.5">
        <p className="text-sm font-medium">{state.goalTitle}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">{state.dailyMinutes} min/day</span>
          <span>·</span>
          <span>{ACCOUNTABILITY_STYLE_LABELS[state.accountabilityStyle]} accountability</span>
          <span>·</span>
          <span className="font-mono tabular-nums">Check-in at {state.checkInTime}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
