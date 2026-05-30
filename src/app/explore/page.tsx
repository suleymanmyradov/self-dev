import { ExploreClient } from '@/components/explore/explore-client';
import { listArticles } from '@/api';

export default async function ExplorePage() {
  const articlesData = await listArticles({ limit: 20 }).catch(() => null);

  return <ExploreClient initialArticles={articlesData ?? undefined} />;
}
