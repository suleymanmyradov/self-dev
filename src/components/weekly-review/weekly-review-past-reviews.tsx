import { FeatureLock } from "@/components/billing/feature-lock";
import type { WeeklyReview } from "@/api";

/** "Past reviews" card — shows history for Pro, FeatureLock for free. */
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
              const rEnd = new Date(r.weekEnd);
              const rWeek = Math.ceil(((rStart.getTime() - new Date(rStart.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
              const rate = Math.min(100, Math.max(0, Math.round(r.completionRate)));
              const dateRange = `${rStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${rEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              return (
                <li key={r.id ?? `${r.weekStart}-${r.weekEnd}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(r.weekStart)}
                    aria-pressed={selectedWeekStart === r.weekStart}
                    className="w-full rounded-lg border border-border px-3 py-3 text-left transition-colors hover:bg-muted/50 aria-pressed:border-success aria-pressed:bg-success/10"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>
                        <span className="block text-sm font-medium">Week {rWeek}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{dateRange}</span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">{rate}%</span>
                    </span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-success" style={{ width: `${rate}%` }} />
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
