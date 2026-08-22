import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WeeklyReview } from "@/api";

/** Color class based on completion rate. */
function getBarColor(rate: number): string {
  if (rate >= 80) return 'bg-success';
  if (rate >= 50) return 'bg-success/70';
  if (rate >= 25) return 'bg-accent';
  return 'bg-destructive/50';
}

/** Per-habit completion breakdown with progress bars. */
export function HabitBreakdown({
  habits,
}: {
  habits: NonNullable<WeeklyReview['habitBreakdown']>;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Per habit</CardTitle>
          <span className="text-xs text-muted-foreground">{habits.length} habit{habits.length === 1 ? '' : 's'}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {habits.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No habit data for this week.</p>
        ) : (
          habits.map((h) => {
            const rate = Math.round(h.completionRate);
            return (
              <div key={h.habitId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{h.habitName}</span>
                  <span className="font-mono text-xs tabular-nums shrink-0 text-muted-foreground">
                    {h.completedCount}/{h.totalCheckIns}
                    <span className="ml-1.5 text-foreground/70">{rate}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-300", getBarColor(rate))}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
