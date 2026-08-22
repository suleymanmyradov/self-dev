import { AlertTriangle, BatteryMedium, CalendarDays, Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReview } from "@/api";

function Distribution({ values }: { values: Record<string, number> }) {
  const entries = Object.entries(values).sort((first, second) => second[1] - first[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No data recorded.</p>;
  }

  return (
    <div className="space-y-2.5">
      {entries.map(([label, count]) => (
        <div key={label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="capitalize">{label.replaceAll('_', ' ')}</span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success/70"
              style={{ width: `${total > 0 ? Math.round((count / total) * 100) : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PatternsCard({ review }: { review: WeeklyReview }) {
  const hasDayPatterns = Boolean(review.bestDay || review.hardestDay || review.topBlocker);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Patterns from your week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasDayPatterns && (
          <div className="grid gap-3 sm:grid-cols-2">
            {review.bestDay && (
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Best day
                </div>
                <p className="mt-1.5 text-sm font-medium">{review.bestDay}</p>
              </div>
            )}
            {review.hardestDay && (
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Hardest day
                </div>
                <p className="mt-1.5 text-sm font-medium">{review.hardestDay}</p>
              </div>
            )}
            {review.topBlocker && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 sm:col-span-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Top blocker
                </div>
                <p className="mt-1.5 text-sm">{review.topBlocker}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Smile className="h-4 w-4 text-muted-foreground" />
              Mood
            </h3>
            <Distribution values={review.moodSummary ?? {}} />
          </section>
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <BatteryMedium className="h-4 w-4 text-muted-foreground" />
              Energy
            </h3>
            <Distribution values={review.energySummary ?? {}} />
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
