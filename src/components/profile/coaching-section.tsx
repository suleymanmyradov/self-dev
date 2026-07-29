"use client";

import { cn } from "@/lib/utils";
import { COACHING_STYLES } from "@/components/profile/types";
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
  onCoachingChange: (style: AccountabilityStyle) => void;
}) {
  const currentStyle = coachingProfile?.accountabilityStyle ?? "balanced";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Coaching</h1>

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-semibold text-sm">How should the coach talk to you?</h2>

        <div className="space-y-3">
          {COACHING_STYLES.map((style) => {
            const isSelected = currentStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onCoachingChange(style.id)}
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
    </div>
  );
}
