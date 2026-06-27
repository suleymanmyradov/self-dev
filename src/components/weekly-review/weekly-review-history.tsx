"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp } from "lucide-react";
import type { WeeklyReview } from "@/api";

export function WeeklyReviewHistory({ reviews, isLoading }: { reviews: WeeklyReview[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading history...
        </CardContent>
      </Card>
    );
  }

  if (!reviews.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No weekly reviews yet. Generate your first review to see it here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r.id ?? `${r.weekStart}-${r.weekEnd}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {r.weekStart} &ndash; {r.weekEnd}
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {Math.round(r.completionRate)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={r.completionRate} className="h-1.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
