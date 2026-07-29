import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReview } from "@/api";

/** Per-habit completion breakdown with progress bars. */
export function HabitBreakdown({
  habits,
}: {
  habits: NonNullable<WeeklyReview['habitBreakdown']>;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Per habit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {habits.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No habit data for this week.</p>
        ) : (
          habits.map((h) => (
            <div key={h.habitId} className="flex items-center gap-3">
              <span className="shrink-0 truncate text-sm font-medium" style={{ width: 190 }}>
                {h.habitName}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success transition-[width] duration-300"
                  style={{ width: `${Math.round(h.completionRate)}%` }}
                />
              </div>
              <span className="font-mono text-xs tabular-nums shrink-0 text-right" style={{ width: 52 }}>
                {h.completedCount}/{h.totalCheckIns}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
