"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { WeeklyReview } from "@/api";

export function WeeklyReviewCoachCard({ review }: { review: WeeklyReview }) {
  return (
    <Card className="border-calm/30 bg-gradient-to-br from-calm/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-calm" />
          AI Coach Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.aiSummary}</p>
      </CardContent>
    </Card>
  );
}
