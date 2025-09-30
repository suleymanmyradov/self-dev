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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 max-w-[600px] mx-auto w-full">
          <div className="w-full border-b pb-3 sticky top-0 z-20 bg-background md:static">
            <div className="w-full overflow-x-auto md:overflow-visible no-scrollbar">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedFilter)} className="w-full">
                <TabsList className="inline-flex min-w-max w-auto justify-start md:justify-center gap-2 bg-transparent p-0 rounded-none">
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
