import { Suspense } from 'react';
import { WeeklyReviewClient } from '@/components/weekly-review/weekly-review-client';
import { getCurrentWeeklyReviewServer, listWeeklyReviewsServer } from '@/api/server';
import { WeeklyReviewSkeleton } from '@/components/weekly-review/weekly-review-skeleton';

export default async function WeeklyReviewPage() {
  const currentReviewPromise = getCurrentWeeklyReviewServer().catch(() => ({ data: null }));
  const reviewsPromise = listWeeklyReviewsServer({ page: 1, limit: 10 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 10, totalPages: 0 } }));

  return (
    <Suspense fallback={<WeeklyReviewSkeleton />}>
      <WeeklyReviewClient
        currentReviewPromise={currentReviewPromise}
        reviewsPromise={reviewsPromise}
      />
    </Suspense>
  );
}
