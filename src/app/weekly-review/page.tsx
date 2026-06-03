import { Suspense } from 'react';
import { WeeklyReviewClient } from '@/components/weekly-review/weekly-review-client';
import { getCurrentWeeklyReview, listWeeklyReviews } from '@/api/weekly-reviews';
import { WeeklyReviewSkeleton } from '@/components/weekly-review/weekly-review-skeleton';

export default async function WeeklyReviewPage() {
  const currentReviewPromise = getCurrentWeeklyReview().catch(() => ({ data: null }));
  const reviewsPromise = listWeeklyReviews({ page: 1, limit: 10 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 10, totalPages: 0 } }));

  return (
    <Suspense fallback={<WeeklyReviewSkeleton />}>
      <WeeklyReviewClient
        currentReviewPromise={currentReviewPromise}
        reviewsPromise={reviewsPromise}
      />
    </Suspense>
  );
}
