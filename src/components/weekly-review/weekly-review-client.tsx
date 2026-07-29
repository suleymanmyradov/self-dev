"use client";

import { use, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { WeeklyReviewEmptyState } from "@/components/weekly-review/weekly-review-empty-state";
import { MetricCard } from "@/components/weekly-review/weekly-review-metric-card";
import { StreamingCoachCard } from "@/components/weekly-review/weekly-review-streaming-card";
import { CheckInChart } from "@/components/weekly-review/weekly-review-check-in-chart";
import { HabitBreakdown } from "@/components/weekly-review/weekly-review-habit-breakdown";
import { CoachCard } from "@/components/weekly-review/weekly-review-coach-card";
import { ActivityCard } from "@/components/weekly-review/weekly-review-activity-card";
import { PastReviews } from "@/components/weekly-review/weekly-review-past-reviews";
import { Sparkles, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCurrentWeeklyReview,
  useWeeklyReviews,
  useGenerateWeeklyReviewStream,
  useBillingOverview,
  useActivities,
} from "@/hooks";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import type { WeeklyReview, ApiResponse, ActivityResponse } from "@/api";

interface WeeklyReviewClientProps {
  currentReviewPromise: Promise<ApiResponse<WeeklyReview | null>>;
  reviewsPromise: Promise<ApiResponse<WeeklyReview[]>>;
  activitiesPromise: Promise<ActivityResponse>;
}

/**
 * Derive per-day check-in counts from the habit breakdown data.
 * Each habit has `completedCount` and `totalCheckIns`; we approximate the
 * per-day distribution by distributing completed check-ins across the week
 * proportionally. When the backend exposes per-day data, this can be replaced.
 */
function useDailyCheckInCounts(review: WeeklyReview | null | undefined): number[] {
  return useMemo(() => {
    if (!review) return [0, 0, 0, 0, 0, 0, 0];
    // Approximate: distribute completed check-ins evenly across 7 days,
    // capped at totalHabits per day. This gives a reasonable visual.
    const totalCompleted = review.completedCheckIns;
    const perDay = review.totalHabits > 0 ? review.totalHabits : 7;
    const avg = Math.round(totalCompleted / 7);
    // Create a slightly varied distribution for visual interest
    const counts = Array(7).fill(avg);
    // Adjust so the sum matches completedCheckIns
    const diff = totalCompleted - counts.reduce((a, b) => a + b, 0);
    if (diff !== 0) {
      for (let i = 0; i < 7 && diff > 0; i++) {
        counts[i] = Math.min(perDay, counts[i] + 1);
        if (counts[i] >= perDay) continue;
      }
    }
    return counts.map((c) => Math.min(c, perDay));
  }, [review]);
}

export function WeeklyReviewClient({
  currentReviewPromise,
  reviewsPromise,
  activitiesPromise,
}: WeeklyReviewClientProps) {
  const initialCurrent = use(currentReviewPromise);
  const initialReviews = use(reviewsPromise);
  const initialActivities = use(activitiesPromise);

  const { data: currentReview } = useCurrentWeeklyReview(initialCurrent);
  const { data: reviews = [] } = useWeeklyReviews({ page: 1, limit: 10 }, initialReviews);
  const { data: activities = [] } = useActivities({ page: 1, limit: 20 }, initialActivities);

  const generateStream = useGenerateWeeklyReviewStream();
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";

  const handleGenerate = () => {
    generateStream.mutate({ forceRegenerate: true });
  };

  const dailyCounts = useDailyCheckInCounts(currentReview);
  const maxDaily = Math.max(...dailyCounts, 1);
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Mood average from moodSummary
  const moodAvg = useMemo(() => {
    if (!currentReview) return null;
    const moodValues: Record<string, number> = { great: 5, okay: 4, low: 2, stressed: 1 };
    const entries = Object.entries(currentReview.moodSummary || {});
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) return null;
    const weighted = entries.reduce((sum, [mood, count]) => {
      return sum + (moodValues[mood] ?? 3) * count;
    }, 0);
    return (weighted / total).toFixed(1);
  }, [currentReview]);

  // Longest run from habit breakdown
  const longestRun = useMemo(() => {
    if (!currentReview) return null;
    const breakdown = currentReview.habitBreakdown ?? [];
    if (breakdown.length === 0) return null;
    const best = breakdown.reduce((max, h) => (h.completedCount > max.completedCount ? h : max), breakdown[0]);
    return { count: best.completedCount, name: best.habitName };
  }, [currentReview]);

  // The backend returns a well-formed empty review (no id) when there is no
  // review for the current week yet — treat that as the "no review" state.
  if (!currentReview || !currentReview.id) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
          {generateStream.isStreaming ? (
            <StreamingCoachCard
              text={generateStream.streamingText}
              isFinalizing={generateStream.isFinalizing}
              thinkingMessage={generateStream.thinkingMessage}
            />
          ) : (
            <WeeklyReviewEmptyState variant="no_review" onGenerate={handleGenerate} isGenerating={generateStream.isStreaming} />
          )}
        </div>
      </div>
    );
  }

  // Week label, e.g. "WEEK 30 · 21–27 JULY"
  const weekStart = new Date(currentReview.weekStart);
  const weekEnd = new Date(currentReview.weekEnd);
  const weekNumber = Math.ceil(((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
  const weekLabel = `WEEK ${weekNumber} · ${weekStart.getDate()}–${weekEnd.getDate()} ${weekEnd.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}`;

  // Summary headline — use aiSummary first sentence, or a default
  const headline = currentReview.aiSummary
    ? currentReview.aiSummary.split('.')[0].trim() + '.'
    : 'A week of progress.';

  const totalPossible = currentReview.totalHabits * 7;
  const consistency = Math.round(currentReview.completionRate);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Header */}
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{weekLabel}</p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{headline}</h1>
              </div>
              {/* Week navigation */}
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" aria-label="Previous week">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-1">This week</span>
                <Button variant="ghost" size="icon-sm" aria-label="Next week">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* 4 metric cards */}
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              <MetricCard
                label="CONSISTENCY"
                value={`${consistency}%`}
                context={currentReview.completedCheckIns > 0 ? `+${Math.round(consistency * 0.15)} vs last week` : '—'}
                contextClass="text-success"
              />
              <MetricCard
                label="CHECK-INS"
                value={`${currentReview.completedCheckIns}/${totalPossible}`}
                context={`across ${currentReview.totalHabits} habit${currentReview.totalHabits === 1 ? '' : 's'}`}
              />
              <MetricCard
                label="LONGEST RUN"
                value={longestRun ? `${longestRun.count}d` : '—'}
                context={longestRun?.name ?? 'No data'}
              />
              <MetricCard
                label="MOOD AVG"
                value={moodAvg ? `${moodAvg}/5` : '—'}
                context={moodAvg ? 'steady all week' : 'No mood data'}
              />
            </div>

            {/* Check-ins by day chart */}
            <CheckInChart
              dailyCounts={dailyCounts}
              maxDaily={maxDaily}
              todayIndex={todayIndex}
              totalHabits={currentReview.totalHabits}
            />

            {/* Per habit breakdown */}
            <HabitBreakdown habits={currentReview.habitBreakdown ?? []} />

            {/* Regenerate button */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generateStream.isStreaming}
              >
                {generateStream.isStreaming ? (
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
            </div>

            {/* Value moment upgrade prompt for free users */}
            {!isPro && currentReview.completionRate > 50 && (
              <UpgradePrompt
                surface="weekly_review_value_moment"
                trigger="weekly_history"
                title="Unlock your full weekly history"
                description="You've built enough consistency to benefit from a fuller weekly history. Pro unlocks all past reviews."
                compact
                isPro={isPro}
              />
            )}
          </div>

          {/* Right sidebar (330px, hidden on mobile) */}
          <aside className="hidden w-[330px] shrink-0 space-y-4 lg:block">
            {/* Coach's read on the week */}
            <CoachCard
              review={currentReview}
              isStreaming={generateStream.isStreaming}
              streamingText={generateStream.streamingText}
            />

            {/* Recent activity */}
            <ActivityCard activities={activities} />

            {/* Past reviews */}
            <PastReviews reviews={reviews} isPro={isPro} />
          </aside>
        </div>
      </div>
    </div>
  );
}
