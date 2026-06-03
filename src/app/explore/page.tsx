import { Suspense } from 'react';
import { ExploreClient } from '@/components/explore/explore-client';
import { listArticlesServer } from '@/api/server';
import { ExploreSkeleton } from '@/components/explore/explore-skeleton';

export default async function ExplorePage() {
  const articlesPromise = listArticlesServer({ limit: 20 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 20, totalPages: 0 } }));

  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreClient articlesPromise={articlesPromise} />
    </Suspense>
  );
}
