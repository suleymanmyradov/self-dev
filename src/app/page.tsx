import { Suspense } from 'react';
import { HomeClient } from '@/components/home/home-client';
import { listCategories } from '@/api';
import { listArticlesServer, listHabitsServer, getTodayCheckInsServer } from '@/api/server';
import { HomeSkeleton } from '@/components/home/home-skeleton';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;

  const categoriesPromise = listCategories('article').catch(() => ({ data: [] }));
  const articlesPromise = (category ? listArticlesServer({ category }) : listArticlesServer()).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 20, totalPages: 0 } }));
  const habitsPromise = listHabitsServer({ page: 1, limit: 100 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 100, totalPages: 0 } }));
  const checkInsPromise = getTodayCheckInsServer().catch(() => ({ data: [], page: { total: 0, page: 1, limit: 20, totalPages: 0 } }));

  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient
        categoriesPromise={categoriesPromise}
        articlesPromise={articlesPromise}
        habitsPromise={habitsPromise}
        checkInsPromise={checkInsPromise}
      />
    </Suspense>
  );
}
