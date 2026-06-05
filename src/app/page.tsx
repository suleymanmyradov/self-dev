import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HomeClient } from '@/components/home/home-client';
import { listArticlesServer, listHabitsServer, getTodayCheckInsServer, listCategoriesServer } from '@/api/server';
import { HomeSkeleton } from '@/components/home/home-skeleton';

const AUTH_COOKIE_NAME = 'auth-token';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  const params = await searchParams;
  const category = typeof params?.category === 'string' ? params.category : undefined;

  const categoriesPromise = listCategoriesServer('article').catch(() => ({ data: [] }));
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
