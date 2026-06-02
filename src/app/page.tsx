import { HomeClient } from '@/components/home/home-client';
import { listCategories, listArticles, listHabits, getTodayCheckIns } from '@/api';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;

  let initialCategories: Array<{ slug: string; name: string }> | null = null;
  let initialArticles: Array<{ id: string; title: string; excerpt?: string; imageUrl?: string; category?: { name: string }; publishedAt: string }> | null = null;
  let initialHabits = undefined;
  let initialCheckIns = undefined;

  try {
    const [categoriesData, articlesData, habitsData, checkInsData] = await Promise.all([
      listCategories('article'),
      category ? listArticles({ category }) : listArticles(),
      listHabits({ page: 1, limit: 100 }),
      getTodayCheckIns(),
    ]);
    initialCategories = categoriesData.data ?? null;
    initialArticles = articlesData.data ?? null;
    initialHabits = habitsData ?? undefined;
    initialCheckIns = checkInsData ?? undefined;
  } catch (error) {
    console.error('[HomePage] Failed to fetch initial data:', error);
  }

  return (
    <HomeClient
      initialCategories={initialCategories}
      initialArticles={initialArticles}
      initialHabits={initialHabits}
      initialCheckIns={initialCheckIns}
    />
  );
}
