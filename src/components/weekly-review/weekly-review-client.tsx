"use client";

import { use, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { WeeklyReviewEmptyState } from "@/components/weekly-review/weekly-review-empty-state";
import { MetricCard } from "@/components/weekly-review/weekly-review-metric-card";
import { CheckInChart } from "@/components/weekly-review/weekly-review-check-in-chart";
import { StreamingCoachCard } from "@/components/weekly-review/weekly-review-streaming-card";
import { HabitBreakdown } from "@/components/weekly-review/weekly-review-habit-breakdown";
import { CoachCard } from "@/components/weekly-review/weekly-review-coach-card";
import { ActivityCard } from "@/components/weekly-review/weekly-review-activity-card";
import { PastReviews } from "@/components/weekly-review/weekly-review-past-reviews";
import { PatternsCard } from "@/components/weekly-review/weekly-review-patterns-card";
import { AdjustmentsCard } from "@/components/weekly-review/weekly-review-adjustments-card";
import { NextPlanCard } from "@/components/weekly-review/weekly-review-next-plan-card";
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

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

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
export function getDailyCheckInCounts(review: WeeklyReview | null | undefined): number[] {
  if (!review) return [0, 0, 0, 0, 0, 0, 0];
  // Approximate: distribute completed check-ins evenly across 7 days,
  // capped at totalHabits per day. This gives a reasonable visual.
  const totalCompleted = Math.max(0, Math.floor(review.completedCheckIns));
  const perDay = review.totalHabits > 0 ? review.totalHabits : totalCompleted;
  const base = Math.floor(totalCompleted / 7);
  const remainder = totalCompleted % 7;
  // Create a slightly varied distribution for visual interest
  const counts = Array.from({ length: 7 }, (_, index) => base + (index < remainder ? 1 : 0));
  // Adjust so the sum matches completedCheckIns
  return counts.map((count) => Math.min(count, perDay));
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
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const isPro = hasHydrated && billing?.subscription?.planCode === "pro";
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);

  const reviewTimeline = useMemo(() => {
    const reviewsByWeek = new Map<string, WeeklyReview>();
    if (currentReview?.id) reviewsByWeek.set(currentReview.weekStart, currentReview);
    for (const review of reviews) {
      if (review.id) reviewsByWeek.set(review.weekStart, review);
    }
    return [...reviewsByWeek.values()].sort(
      (first, second) => new Date(second.weekStart).getTime() - new Date(first.weekStart).getTime(),
    );
  }, [currentReview, reviews]);
  const visibleTimeline = isPro ? reviewTimeline : reviewTimeline.slice(0, 1);
  const activeReview = visibleTimeline.find((review) => review.weekStart === selectedWeekStart) ?? visibleTimeline[0];
  const activeReviewIndex = activeReview ? visibleTimeline.findIndex((review) => review.weekStart === activeReview.weekStart) : -1;
  const previousReview = activeReviewIndex >= 0 ? visibleTimeline[activeReviewIndex + 1] : undefined;
  const isCurrentReview = Boolean(currentReview?.id && activeReview?.weekStart === currentReview.weekStart);

  const handleGenerate = () => {
    generateStream.mutate({ weekStart: activeReview?.weekStart, forceRegenerate: true });
  };

  const dailyCounts = useMemo(() => getDailyCheckInCounts(activeReview), [activeReview]);
  const maxDaily = Math.max(...dailyCounts, 1);
  const todayIndex = isCurrentReview ? (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) : -1;

  // Mood average from moodSummary
  const moodAvg = useMemo(() => {
    if (!activeReview) return null;
    const moodValues: Record<string, number> = { great: 5, okay: 4, low: 2, stressed: 1 };
    const entries = Object.entries(activeReview.moodSummary || {});
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) return null;
    const weighted = entries.reduce((sum, [mood, count]) => {
      return sum + (moodValues[mood] ?? 3) * count;
    }, 0);
    return (weighted / total).toFixed(1);
  }, [activeReview]);

  // Longest run from habit breakdown
  const longestRun = useMemo(() => {
    if (!activeReview) return null;
    const breakdown = activeReview.habitBreakdown ?? [];
    if (breakdown.length === 0) return null;
    const best = breakdown.reduce((max, h) => (h.completedCount > max.completedCount ? h : max), breakdown[0]);
    return { count: best.completedCount, name: best.habitName };
  }, [activeReview]);

  // The backend returns a well-formed empty review (no id) when there is no
  // review for the current week yet — treat that as the "no review" state.
  if (!activeReview) {
    return (
      <div className="h-full overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
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
  const weekStart = new Date(activeReview.weekStart);
  const weekEnd = new Date(activeReview.weekEnd);
  const weekNumber = Math.ceil(((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
  const weekLabel = `WEEK ${weekNumber} · ${weekStart.getDate()}–${weekEnd.getDate()} ${weekEnd.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}`;

  // Summary headline — use aiSummary first sentence, or a default
  const headline = activeReview.aiSummary
    ? activeReview.aiSummary.split('.')[0].trim() + '.'
    : 'A week of progress.';

  const totalPossible = activeReview.completedCheckIns + activeReview.missedCheckIns;
  const consistency = Math.round(activeReview.completionRate);
  const consistencyChange = previousReview ? consistency - Math.round(previousReview.completionRate) : null;
  const consistencyContext = consistencyChange === null
    ? 'No prior review'
    : `${consistencyChange >= 0 ? '+' : ''}${consistencyChange} vs previous review`;
  const consistencyClass = consistencyChange === null ? undefined : consistencyChange >= 0 ? 'text-success' : 'text-destructive';

  const canNavigate = visibleTimeline.length > 1;

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
        <div className="space-y-6">
          {/* Main column */}
          <div className="min-w-0 space-y-6">
            {/* Header with integrated week navigation */}
            <header className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{weekLabel}</p>
                  <h1 className="mt-1 font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-3xl">{headline}</h1>
                </div>
                {/* Regenerate button — integrated into header */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateStream.isStreaming}
                  className="shrink-0"
                >
                  {generateStream.isStreaming ? (
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Regenerate</span>
                </Button>
              </div>

              {/* Week navigation bar — more prominent and discoverable */}
              {canNavigate && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Previous available review"
                    disabled={activeReviewIndex >= visibleTimeline.length - 1}
                    onClick={() => setSelectedWeekStart(visibleTimeline[activeReviewIndex + 1]?.weekStart ?? null)}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Older</span>
                  </Button>
                  <span className="text-sm font-medium text-foreground">
                    {isCurrentReview ? 'This week' : 'Past review'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Next available review"
                    disabled={activeReviewIndex <= 0}
                    onClick={() => setSelectedWeekStart(visibleTimeline[activeReviewIndex - 1]?.weekStart ?? null)}
                    className="gap-1"
                  >
                    <span className="hidden sm:inline">Newer</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </header>

            {/* 4 metric cards */}
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              <MetricCard
                label="CONSISTENCY"
                value={`${consistency}%`}
                context={consistencyContext}
                contextClass={consistencyClass}
              />
              <MetricCard
                label="CHECK-INS"
                value={`${activeReview.completedCheckIns}/${totalPossible}`}
                context={`across ${activeReview.totalHabits} habit${activeReview.totalHabits === 1 ? '' : 's'}`}
              />
              <MetricCard
                label="MOST COMPLETED"
                value={longestRun ? `${longestRun.count}` : '—'}
                context={longestRun?.name ?? 'No data'}
              />
              <MetricCard
                label="MOOD AVG"
                value={moodAvg ? `${moodAvg}/5` : '—'}
                context={moodAvg ? 'steady all week' : 'No mood data'}
              />
            </div>

            {/* Coach's read on the week */}
            <CoachCard
              review={activeReview}
              isStreaming={generateStream.isStreaming}
              streamingText={generateStream.streamingText}
            />

            <PatternsCard review={activeReview} />

            {/* Check-ins by day chart */}
            <CheckInChart
              dailyCounts={dailyCounts}
              maxDaily={maxDaily}
              todayIndex={todayIndex}
              totalHabits={activeReview.totalHabits}
            />

            {/* Per habit breakdown */}
            <HabitBreakdown habits={activeReview.habitBreakdown ?? []} />

            <AdjustmentsCard adjustments={activeReview.suggestedAdjustments ?? []} />

            <NextPlanCard plan={activeReview.nextWeekPlan} />

            {/* Value moment upgrade prompt for free users */}
            {!isPro && activeReview.completionRate > 50 && (
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

          {/* Supporting sections continue in the same reading flow */}
          <aside className="w-full space-y-6">
            {/* Recent activity */}
            <ActivityCard activities={activities} />

            {/* Past reviews */}
            <PastReviews
              reviews={visibleTimeline.filter((review) => review.weekStart !== currentReview?.weekStart)}
              isPro={isPro}
              selectedWeekStart={activeReview.weekStart}
              onSelect={(weekStart) => setSelectedWeekStart(weekStart)}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
