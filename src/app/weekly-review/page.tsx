"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { WeeklyReviewEmptyState } from "@/components/weekly-review/weekly-review-empty-state";
import { WeeklyReviewSummaryCard } from "@/components/weekly-review/weekly-review-summary-card";
import { WeeklyReviewCoachCard } from "@/components/weekly-review/weekly-review-coach-card";
import { WeeklyReviewHabitBreakdown } from "@/components/weekly-review/weekly-review-habit-breakdown";
import { WeeklyReviewPatternsCard } from "@/components/weekly-review/weekly-review-patterns-card";
import { WeeklyReviewAdjustmentsCard } from "@/components/weekly-review/weekly-review-adjustments-card";
import { WeeklyReviewNextPlanCard } from "@/components/weekly-review/weekly-review-next-plan-card";
import { WeeklyReviewHistory } from "@/components/weekly-review/weekly-review-history";
import { Sparkles, RotateCcw, Calendar } from "lucide-react";
import { useCurrentWeeklyReview, useGenerateWeeklyReview, useWeeklyReviews } from "@/hooks";

export default function WeeklyReviewPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: currentReview, isLoading, error, refetch } = useCurrentWeeklyReview();
  const generateMutation = useGenerateWeeklyReview();
  const { data: reviews, isLoading: historyLoading } = useWeeklyReviews({ page: 1, limit: 10 });

  const handleGenerate = () => {
    generateMutation.mutate({ forceRegenerate: true });
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">Failed to load weekly review. Please try again.</p>
          <Button onClick={() => refetch()} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

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
          <WeeklyReviewHistory reviews={reviews ?? []} isLoading={historyLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
