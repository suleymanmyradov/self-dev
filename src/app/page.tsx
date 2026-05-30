import { HomeClient } from '@/components/home/home-client';
import { listCategories, listArticles, listHabits, getTodayCheckIns } from '@/api';

export default async function HomePage() {
  const [categoriesData, articlesData, habitsData, checkInsData] = await Promise.all([
    listCategories('article').catch(() => null),
    listArticles().catch(() => null),
    listHabits({ page: 1, limit: 100 }).catch(() => null),
    getTodayCheckIns().catch(() => null),
  ]);

  return (
    <HomeClient
      initialCategories={categoriesData?.data ?? null}
      initialArticles={articlesData?.data ?? null}
      initialHabits={habitsData ?? undefined}
      initialCheckIns={checkInsData ?? undefined}
    />
  );
}
