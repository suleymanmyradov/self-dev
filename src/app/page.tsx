import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HomeClient } from '@/components/home/home-client';
import {
    listHabitsServer,
    getTodayCheckInsServer,
} from '@/api/server';
import { listArticlesCached, listCategoriesCached } from '@/api/server-cache';
import { swallowOptional } from '@/lib/server-data';
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

    // Categories are non-critical — the client has hardcoded defaults.
    // Uses the cached (unauthenticated) fetch since categories are public.
    const categoriesPromise = swallowOptional(
        listCategoriesCached('article'),
        { data: [] },
    );
    // Articles are public content — use the cached fetch. Habits and check-ins
    // are per-user and remain authenticated server fetches.
    const articlesPromise = category
        ? listArticlesCached({ category })
        : listArticlesCached();
    const habitsPromise = listHabitsServer({ page: 1, limit: 100 });
    const checkInsPromise = getTodayCheckInsServer();

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
