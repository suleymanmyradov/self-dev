"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCurrentWeeklyReview, useWeeklyReviews, useGenerateWeeklyReviewStream, useBillingOverview } from "@/hooks";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { FeatureLock } from "@/components/billing/feature-lock";
import { useSearchParamState } from "@/lib/url-state";
import type { WeeklyReview, ApiResponse } from "@/api";

interface WeeklyReviewClientProps {
  currentReviewPromise: Promise<ApiResponse<WeeklyReview | null>>;
  reviewsPromise: Promise<ApiResponse<WeeklyReview[]>>;
}

export function WeeklyReviewClient({ currentReviewPromise, reviewsPromise }: WeeklyReviewClientProps) {
  const [activeTab, setActiveTab] = useSearchParamState("tab", "overview");

  const initialCurrent = use(currentReviewPromise);
  const initialReviews = use(reviewsPromise);

  const { data: currentReview } = useCurrentWeeklyReview(initialCurrent);
  const { data: reviews = [] } = useWeeklyReviews({ page: 1, limit: 10 }, initialReviews);

  const generateStream = useGenerateWeeklyReviewStream();
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";

  const handleGenerate = () => {
    generateStream.mutate({ forceRegenerate: true });
  };

  // The backend returns a well-formed empty review (no id) when there is no
  // review for the current week yet — treat that as the "no review" state.
  if (!currentReview || !currentReview.id) {
    return (
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
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
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
          {generateStream.isStreaming ? (
            <StreamingCoachCard
              text={generateStream.streamingText}
              isFinalizing={generateStream.isFinalizing}
              thinkingMessage={generateStream.thinkingMessage}
            />
          ) : (
            currentReview.aiSummary && <WeeklyReviewCoachCard review={currentReview} />
          )}
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
            <WeeklyReviewHistory reviews={reviews} isLoading={false} />
          ) : (
            <FeatureLock feature="weekly_review_history" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Shows the AI summary text as it streams in, with a typing cursor. */
function StreamingCoachCard({
  text,
  isFinalizing,
  thinkingMessage,
}: {
  text: string;
  isFinalizing?: boolean;
  thinkingMessage?: string;
}) {
  return (
    <Card className="border-calm/30 bg-gradient-to-br from-calm/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-calm animate-pulse" />
          {isFinalizing ? 'Finalizing your review...' : text ? 'AI Coach is writing...' : 'AI Coach is thinking...'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {text ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {text}
            {!isFinalizing && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-calm/60 animate-pulse align-middle" />
            )}
          </p>
        ) : (
          <div className="flex items-center gap-2 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-calm/60 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-calm/60 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-calm/60 animate-bounce" />
            </div>
            {thinkingMessage && (
              <span className="text-sm text-muted-foreground animate-pulse">{thinkingMessage}</span>
            )}
          </div>
        )}
        {isFinalizing && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3 animate-spin" />
            Generating adjustments &amp; next-week plan...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
