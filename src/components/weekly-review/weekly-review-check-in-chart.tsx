import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Bar chart showing check-in counts per day of the week. */
export function CheckInChart({
  dailyCounts,
  maxDaily,
  todayIndex,
  totalHabits,
}: {
  dailyCounts: number[];
  maxDaily: number;
  todayIndex: number;
  totalHabits: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Check-ins by day</CardTitle>
          <span className="text-xs text-muted-foreground">{totalHabits} habits possible per day</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
          {dailyCounts.map((count, i) => {
            const heightPct = maxDaily > 0 ? (count / maxDaily) * 100 : 0;
            const isToday = i === todayIndex;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                {/* Number above bar */}
                <span className="font-mono text-xs tabular-nums text-foreground">{count}</span>
                {/* Bar */}
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-[28px] rounded-t-sm transition-[height] duration-300",
                      isToday ? "bg-success/60" : "bg-success"
                    )}
                    style={{ height: `${heightPct}%`, minHeight: count > 0 ? 4 : 0 }}
                  />
                </div>
                {/* Day label */}
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{DAY_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
