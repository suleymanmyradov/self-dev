'use client';

import { useMemo } from 'react';
import { ArticleCard } from '@/components/home/article-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFeedFilter } from '@/store/feed-filter';
import type { FeedFilter } from '@/store/feed-filter';
import { articles, type Article, type ArticleCategory } from '@/lib/articles';

export function HomeClient() {
  const { filter, setFilter } = useFeedFilter();

  const filteredArticles: ReadonlyArray<Article> = useMemo(
    () => (filter === 'all' ? articles : articles.filter(a => a.category === (filter as ArticleCategory))),
    [filter],
  );

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-1)_0%,transparent_68%)] opacity-35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-3)_0%,transparent_70%)] opacity-30 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-[720px] px-4 pb-10">
          <div className="pt-6 pb-4 border-b">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Daily Focus
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold leading-tight md:text-4xl">
                Insights to help you grow with clarity.
              </h1>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                Curated reads on mindset, habits, and relationships. Pick a lane or roam the feed.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground/80">
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">Mindset</span>
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">Momentum</span>
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">Connection</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full overflow-x-auto md:overflow-visible no-scrollbar">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedFilter)} className="w-full">
                <TabsList className="inline-flex min-w-max w-auto justify-start md:justify-center">
                  <TabsTrigger className="shrink-0" value="all">All</TabsTrigger>
                  <TabsTrigger className="shrink-0" value="philosophy">Philosophy</TabsTrigger>
                  <TabsTrigger className="shrink-0" value="habits">Habits</TabsTrigger>
                  <TabsTrigger className="shrink-0" value="relationships">Relationships</TabsTrigger>
                  <TabsTrigger className="shrink-0" value="productivity">Productivity</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="mt-4 space-y-6">
            {filteredArticles.map((a) => (
              <ArticleCard
                key={a.id}
                id={a.id}
                title={a.title}
                excerpt={a.excerpt}
                image={a.image}
                category={a.category}
                postedAt={a.postedAt}
                likes={a.likes}
                shares={a.shares}
                saves={a.saves}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
