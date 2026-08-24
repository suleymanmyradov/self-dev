"use client";

import { cn } from "@/lib/utils";
import { COACHING_STYLES, COACHING_TONES, COACHING_DIFFICULTIES } from "@/components/profile/types";
import type { AccountabilityStyle, PreferredTone, DifficultyPreference } from "@/api";

export function CoachingSection({
  coachingProfile,
  coachingPending,
  onCoachingChange,
}: {
  coachingProfile: {
    accountabilityStyle: AccountabilityStyle;
    preferredTone: PreferredTone;
    difficultyPreference: DifficultyPreference;
  } | null;
  coachingPending: boolean;
  onCoachingChange: (overrides: {
    accountabilityStyle?: AccountabilityStyle;
    preferredTone?: PreferredTone;
    difficultyPreference?: DifficultyPreference;
  }) => void;
}) {
  const currentStyle = coachingProfile?.accountabilityStyle ?? "balanced";
  const currentTone = coachingProfile?.preferredTone ?? "supportive";
  const currentDifficulty = coachingProfile?.difficultyPreference ?? "adaptive";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Coaching</h1>

      {/* Accountability style */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-semibold text-sm">How should the coach talk to you?</h2>

        <div className="space-y-3">
          {COACHING_STYLES.map((style) => {
            const isSelected = currentStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onCoachingChange({ accountabilityStyle: style.id })}
                disabled={coachingPending}
                className={cn(
                  "w-full text-left rounded-xl p-4 transition-[color,background-color,border-color] disabled:opacity-50",
                  isSelected
                    ? "border-2 border-foreground bg-card"
                    : "border border-border bg-card hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{style.label}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono tracking-wider text-muted-foreground">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{style.quote}&rdquo;
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred tone */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-semibold text-sm">Preferred tone</h2>
        <p className="text-xs text-muted-foreground -mt-2">The emotional register the coach uses in feedback</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COACHING_TONES.map((tone) => {
            const isSelected = currentTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => onCoachingChange({ preferredTone: tone.id })}
                disabled={coachingPending}
                className={cn(
                  "text-left rounded-lg p-3 transition-[color,background-color,border-color] disabled:opacity-50",
                  isSelected
                    ? "border-2 border-foreground bg-card"
                    : "border border-border bg-card hover:bg-muted/30"
                )}
              >
                <span className="text-sm font-medium">{tone.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{tone.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty preference */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-semibold text-sm">Difficulty preference</h2>
        <p className="text-xs text-muted-foreground -mt-2">How ambitious the coach should be when suggesting plans</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COACHING_DIFFICULTIES.map((diff) => {
            const isSelected = currentDifficulty === diff.id;
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => onCoachingChange({ difficultyPreference: diff.id })}
                disabled={coachingPending}
                className={cn(
                  "text-left rounded-lg p-3 transition-[color,background-color,border-color] disabled:opacity-50",
                  isSelected
                    ? "border-2 border-foreground bg-card"
                    : "border border-border bg-card hover:bg-muted/30"
                )}
              >
                <span className="text-sm font-medium">{diff.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{diff.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
