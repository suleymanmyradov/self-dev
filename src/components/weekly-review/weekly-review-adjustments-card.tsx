import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReviewAdjustment } from "@/api";

const adjustmentLabels: Record<WeeklyReviewAdjustment['adjustmentType'], string> = {
  keep_same: 'Keep the same',
  reduce_difficulty: 'Make it easier',
  change_time: 'Change the time',
  clarify_plan: 'Clarify the plan',
  pause_habit: 'Pause the habit',
};

export function AdjustmentsCard({ adjustments }: { adjustments: WeeklyReviewAdjustment[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Suggested adjustments</CardTitle>
      </CardHeader>
      <CardContent>
        {adjustments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No adjustments suggested for this week.</p>
        ) : (
          <div className="space-y-3">
            {adjustments.map((adjustment, index) => (
              <article
                key={`${adjustment.habitId ?? adjustment.habitName}-${adjustment.adjustmentType}-${index}`}
                className="rounded-lg border border-border/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{adjustment.habitName}</h3>
                  <Badge variant="secondary">{adjustmentLabels[adjustment.adjustmentType]}</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{adjustment.reason}</p>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{adjustment.suggestion}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
