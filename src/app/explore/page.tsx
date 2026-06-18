import { Suspense } from 'react';
import { ExploreClient } from '@/components/explore/explore-client';
import { listArticlesCached } from '@/api/server-cache';
import { ExploreSkeleton } from '@/components/explore/explore-skeleton';

export default async function ExplorePage() {
  const articlesPromise = listArticlesCached({ limit: 20 });

  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreClient articlesPromise={articlesPromise} />
    </Suspense>
  );
}
