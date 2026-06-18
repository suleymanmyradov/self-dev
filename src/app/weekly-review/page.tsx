import { Suspense } from 'react';
import { WeeklyReviewClient } from '@/components/weekly-review/weekly-review-client';
import { getCurrentWeeklyReviewServer, listWeeklyReviewsServer } from '@/api/server';
import { swallowNotFound } from '@/lib/server-data';
import { WeeklyReviewSkeleton } from '@/components/weekly-review/weekly-review-skeleton';
import type { ApiResponse, WeeklyReview } from '@/api';

export default async function WeeklyReviewPage() {
  // 404 = no review this week yet → show "no current review" state.
  const currentReviewPromise = swallowNotFound<ApiResponse<WeeklyReview | null>>(
    getCurrentWeeklyReviewServer(),
    { data: null },
  );
  // Reviews list is critical — let errors throw to error.tsx.
  const reviewsPromise = listWeeklyReviewsServer({ page: 1, limit: 10 });

  return (
    <Suspense fallback={<WeeklyReviewSkeleton />}>
      <WeeklyReviewClient
        currentReviewPromise={currentReviewPromise}
        reviewsPromise={reviewsPromise}
      />
    </Suspense>
  );
}
