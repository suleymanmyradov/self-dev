"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Lightbulb } from "lucide-react";
import type { WeeklyReviewAdjustment } from "@/api";

const adjustmentLabel: Record<string, string> = {
  keep_same: "Keep Same",
  reduce_difficulty: "Reduce Difficulty",
  change_time: "Change Time",
  clarify_plan: "Clarify Plan",
  pause_habit: "Pause Habit",
};

export function WeeklyReviewAdjustmentsCard({ adjustments }: { adjustments: WeeklyReviewAdjustment[] }) {
  if (!adjustments.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No adjustments suggested for this week.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Wrench className="h-4 w-4 text-energy" />
          Suggested Adjustments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {adjustments.map((a) => (
          <div key={a.habitId || a.habitName} className="rounded-lg bg-muted/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{a.habitName}</span>
              <Badge variant="secondary" className="text-xs">
                {adjustmentLabel[a.adjustmentType] || a.adjustmentType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{a.reason}</p>
            <div className="flex items-start gap-1.5 text-xs">
              <Lightbulb className="h-3.5 w-3.5 text-calm mt-0.5 shrink-0" />
              <span>{a.suggestion}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
