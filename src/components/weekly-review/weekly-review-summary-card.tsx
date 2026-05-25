"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import type { WeeklyReview } from "@/api";

export function WeeklyReviewSummaryCard({ review }: { review: WeeklyReview }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-growth" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Completion Rate</span>
            <span className="font-semibold">{Math.round(review.completionRate)}%</span>
          </div>
          <Progress value={review.completionRate} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-growth-soft/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-growth" />
            <div>
              <div className="text-lg font-bold">{review.completedCheckIns}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-lg font-bold">{review.missedCheckIns}</div>
              <div className="text-xs text-muted-foreground">Missed</div>
            </div>
          </div>
        </div>
        {review.bestDay && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-energy" />
            <span className="text-muted-foreground">Best day:</span>
            <span className="font-medium">{review.bestDay}</span>
          </div>
        )}
        {review.hardestDay && (
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-muted-foreground">Hardest day:</span>
            <span className="font-medium">{review.hardestDay}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
