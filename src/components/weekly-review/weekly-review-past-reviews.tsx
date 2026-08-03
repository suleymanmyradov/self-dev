import { FeatureLock } from "@/components/billing/feature-lock";
import type { WeeklyReview } from "@/api";

/** "Past reviews" sidebar card — shows history for Pro, FeatureLock for free. */
export function PastReviews({
  reviews,
  isPro,
  selectedWeekStart,
  onSelect,
}: {
  reviews: WeeklyReview[];
  isPro: boolean;
  selectedWeekStart: string;
  onSelect: (weekStart: string) => void;
}) {
  return (
    <div className="rounded-xl bg-card p-5">
      <h2 className="text-sm font-semibold">Past reviews</h2>
      {isPro ? (
        reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No past reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {reviews.slice(0, 5).map((r) => {
              const rStart = new Date(r.weekStart);
              const rWeek = Math.ceil(((rStart.getTime() - new Date(rStart.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
              return (
                <li key={r.id ?? `${r.weekStart}-${r.weekEnd}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(r.weekStart)}
                    aria-pressed={selectedWeekStart === r.weekStart}
                    className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-muted/50 aria-pressed:border-success aria-pressed:bg-success/10"
                  >
                    <span className="text-sm font-medium">Week {rWeek}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {Math.round(r.completionRate)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <div className="mt-3">
          <FeatureLock feature="weekly_review_history" />
        </div>
      )}
    </div>
  );
}
