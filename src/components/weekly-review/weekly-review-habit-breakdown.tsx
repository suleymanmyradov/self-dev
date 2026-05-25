"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import type { WeeklyReviewHabitBreakdown } from "@/api";

export function WeeklyReviewHabitBreakdown({ habits }: { habits: WeeklyReviewHabitBreakdown[] }) {
  if (!habits.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No habit data for this week.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((h) => (
        <Card key={h.habitId}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-growth" />
              {h.habitName}
              {h.category && (
                <span className="ml-auto text-xs text-muted-foreground">{h.category}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{h.completedCount} done / {h.missedCount} missed</span>
              <span>{Math.round(h.completionRate)}%</span>
            </div>
            <Progress value={h.completionRate} className="h-1.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
