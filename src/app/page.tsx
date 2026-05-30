import { HomeClient } from '@/components/home/home-client';
import { listCategories, listArticles, listHabits, getTodayCheckIns } from '@/api';

export default async function HomePage() {
  try {
    const [categoriesData, articlesData, habitsData, checkInsData] = await Promise.all([
      listCategories('article'),
      listArticles(),
      listHabits({ page: 1, limit: 100 }),
      getTodayCheckIns(),
    ]);

    return (
      <HomeClient
        initialCategories={categoriesData.data ?? null}
        initialArticles={articlesData.data ?? null}
        initialHabits={habitsData ?? undefined}
        initialCheckIns={checkInsData ?? undefined}
      />
    );
  } catch (error) {
    console.error('[HomePage] Failed to fetch initial data:', error);
    // Graceful degradation: render client with null data so it can retry/fetch on client
    return (
      <HomeClient
        initialCategories={null}
        initialArticles={null}
        initialHabits={undefined}
        initialCheckIns={undefined}
      />
    );
  }
}
