import { Suspense } from 'react';
import { WeeklyReviewClient } from '@/components/weekly-review/weekly-review-client';
import { getCurrentWeeklyReviewServer, listWeeklyReviewsServer } from '@/api/server';
import { WeeklyReviewSkeleton } from '@/components/weekly-review/weekly-review-skeleton';

export default async function WeeklyReviewPage() {
  // When there is no review for the current week, the backend returns a
  // well-formed empty review (no id); the client renders the empty state.
  // Real errors propagate to error.tsx.
  const currentReviewPromise = getCurrentWeeklyReviewServer();
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
