"use client";

import { use, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyReviewEmptyState } from "@/components/weekly-review/weekly-review-empty-state";
import { WeeklyReviewSummaryCard } from "@/components/weekly-review/weekly-review-summary-card";
import { WeeklyReviewCoachCard } from "@/components/weekly-review/weekly-review-coach-card";
import { WeeklyReviewHabitBreakdown } from "@/components/weekly-review/weekly-review-habit-breakdown";
import { WeeklyReviewPatternsCard } from "@/components/weekly-review/weekly-review-patterns-card";
import { WeeklyReviewAdjustmentsCard } from "@/components/weekly-review/weekly-review-adjustments-card";
import { WeeklyReviewNextPlanCard } from "@/components/weekly-review/weekly-review-next-plan-card";
import { WeeklyReviewHistory } from "@/components/weekly-review/weekly-review-history";
import { Sparkles, RotateCcw, Calendar } from "lucide-react";
import { useGenerateWeeklyReview, useBillingOverview } from "@/hooks";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { FeatureLock } from "@/components/billing/feature-lock";
import { useSearchParamState } from "@/lib/url-state";
import type { WeeklyReview, ApiResponse } from "@/api";
import { getCurrentWeeklyReview, listWeeklyReviews } from "@/api/weekly-reviews";

interface WeeklyReviewClientProps {
  currentReviewPromise: Promise<ApiResponse<WeeklyReview | null>>;
  reviewsPromise: Promise<ApiResponse<WeeklyReview[]>>;
}

export function WeeklyReviewClient({ currentReviewPromise, reviewsPromise }: WeeklyReviewClientProps) {
  const [activeTab, setActiveTab] = useSearchParamState("tab", "overview");

  const initialCurrent = use(currentReviewPromise);
  const initialReviews = use(reviewsPromise);

  const [currentReview, setCurrentReview] = useState(initialCurrent.data);
  const [reviews, setReviews] = useState(initialReviews.data ?? []);
  const [isPending, startTransition] = useTransition();

  const generateMutation = useGenerateWeeklyReview();
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";

  const handleGenerate = () => {
    generateMutation.mutate({ forceRegenerate: true });
  };

  const handleRefetch = () => {
    startTransition(async () => {
      const [freshCurrent, freshReviews] = await Promise.all([
        getCurrentWeeklyReview().catch(() => ({ data: null })),
        listWeeklyReviews({ page: 1, limit: 10 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 10, totalPages: 0 } })),
      ]);
      setCurrentReview(freshCurrent.data);
      setReviews(freshReviews.data ?? []);
    });
  };

  if (!currentReview) {
    return (
      <div className="container max-w-5xl py-8">
        <WeeklyReviewEmptyState variant="no_review" onGenerate={handleGenerate} isGenerating={generateMutation.isPending} />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Review</h1>
          <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
            <Calendar className="h-4 w-4" />
            {currentReview.weekStart} &ndash; {currentReview.weekEnd}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Regenerate
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="plan">Next Week</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <WeeklyReviewSummaryCard review={currentReview} />
            <WeeklyReviewPatternsCard review={currentReview} />
          </div>
          {currentReview.aiSummary && <WeeklyReviewCoachCard review={currentReview} />}
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
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <WeeklyReviewHabitBreakdown habits={currentReview.habitBreakdown} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <WeeklyReviewAdjustmentsCard adjustments={currentReview.suggestedAdjustments} />
          {currentReview.aiSummary && <WeeklyReviewCoachCard review={currentReview} />}
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <WeeklyReviewNextPlanCard plan={currentReview.nextWeekPlan} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isPro ? (
            <WeeklyReviewHistory reviews={reviews ?? []} isLoading={isPending} />
          ) : (
            <FeatureLock feature="weekly_review_history">
              <WeeklyReviewHistory reviews={reviews ?? []} isLoading={isPending} />
            </FeatureLock>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
