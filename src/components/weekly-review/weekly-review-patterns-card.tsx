"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Smile, Zap, AlertTriangle } from "lucide-react";
import type { WeeklyReview } from "@/api";

function MoodBar({ label, count, maxCount }: { label: string; count: number; maxCount: number }) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-16 text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-calm rounded-full" style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-6 text-right font-medium">{count}</span>
    </div>
  );
}

export function WeeklyReviewPatternsCard({ review }: { review: WeeklyReview }) {
  const moods = Object.entries(review.moodSummary || {}).sort((a, b) => b[1] - a[1]);
  const energies = Object.entries(review.energySummary || {}).sort((a, b) => b[1] - a[1]);
  const maxMoodCount = moods.length > 0 ? Math.max(...moods.map(([, count]) => count)) : 0;
  const maxEnergyCount = energies.length > 0 ? Math.max(...energies.map(([, count]) => count)) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-energy" />
          Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {review.topBlocker && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-red-600">Top Blocker</div>
              <div className="text-sm">{review.topBlocker}</div>
            </div>
          </div>
        )}
        {moods.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Smile className="h-3.5 w-3.5" />
              Mood Distribution
            </div>
            {moods.map(([label, count]) => (
              <MoodBar key={label} label={label} count={count} maxCount={maxMoodCount} />
            ))}
          </div>
        )}
        {energies.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Energy Distribution
            </div>
            {energies.map(([label, count]) => (
              <MoodBar key={label} label={label} count={count} maxCount={maxEnergyCount} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
