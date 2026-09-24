import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { HomeClient } from '@/components/home/home-client';
import { listArticlesCached, listCategoriesCached } from '@/api/server-cache';
import { swallowOptional } from '@/lib/server-data';
import { HomeSkeleton } from '@/components/home/home-skeleton';
import { Button } from '@/components/ui/button';

const AUTH_COOKIE_NAME = 'auth-token';

function LandingPage() {
    return (
        <section className="mx-auto w-full max-w-2xl px-4 py-16">
            <h1 className="font-display-face text-4xl font-semibold tracking-tight">
                Build better habits with an AI coach that keeps you accountable
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Evolella is a habit and goal tracker with a personal AI accountability coach.
                Set goals, build routines, check in daily, and get a weekly review — your coach
                adapts your plan based on how you actually do.
            </p>

            <div className="mt-8 flex gap-3">
                <Button asChild size="lg">
                    <Link href="/register">Get started free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/pricing">See pricing</Link>
                </Button>
            </div>

            <ul className="mt-12 space-y-4 text-sm text-muted-foreground">
                <li>
                    <strong className="text-foreground">Habits &amp; goals.</strong> Track daily
                    habits and long-term goals in one place.
                </li>
                <li>
                    <strong className="text-foreground">AI accountability coach.</strong>{' '}
                    Personalized check-ins and plan adjustments based on your progress.
                </li>
                <li>
                    <strong className="text-foreground">Weekly review.</strong> A clear summary of
                    what worked, what didn&apos;t, and what to change next week.
                </li>
                <li>
                    <strong className="text-foreground">Free and Pro plans.</strong> Start free —
                    upgrade anytime for unlimited habits, goals, and coaching memory.
                </li>
            </ul>

            <footer className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
                <Link className="underline-offset-2 hover:underline" href="/pricing">
                    Pricing
                </Link>
                <Link className="underline-offset-2 hover:underline" href="/terms">
                    Terms
                </Link>
                <Link className="underline-offset-2 hover:underline" href="/privacy">
                    Privacy
                </Link>
                <Link className="underline-offset-2 hover:underline" href="/refunds">
                    Refunds
                </Link>
                <a
                    className="underline-offset-2 hover:underline"
                    href="mailto:support@evolella.com"
                >
                    support@evolella.com
                </a>
            </footer>
        </section>
    );
}

export default async function HomePage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    // Anonymous visitors get the public landing page — the app itself
    // requires an account, but the site must show what the product is
    // (also required for Paddle website verification).
    if (!token) {
        return <LandingPage />;
    }

    const params = await searchParams;
    const category = typeof params?.category === 'string' ? params.category : undefined;

    // Categories are non-critical — the client has hardcoded defaults.
    // Uses the cached (unauthenticated) fetch since categories are public.
    const categoriesPromise = swallowOptional(
        listCategoriesCached('article'),
        { data: [] },
    );
    // Articles are public content — use the cached fetch.
    const articlesPromise = category
        ? listArticlesCached({ category })
        : listArticlesCached();

    return (
        <Suspense fallback={<HomeSkeleton />}>
            <HomeClient
                categoriesPromise={categoriesPromise}
                articlesPromise={articlesPromise}
            />
        </Suspense>
    );
}
