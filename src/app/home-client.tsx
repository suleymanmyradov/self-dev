'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArticleCardGrid } from '@/components/home/article-card-grid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFeedFilter } from '@/store/feed-filter';
import type { FeedFilter } from '@/store/feed-filter';
import { listCategories, listArticles } from '@/api';

const TAB_TRIGGER_CLASS =
  'shrink-0 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground';

const DEFAULT_CATEGORIES: { value: FeedFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'habits', label: 'Habits' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'productivity', label: 'Productivity' },
];

export function HomeClient() {
  const { filter, setFilter } = useFeedFilter();

  // Fetch categories with TanStack Query
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'article'],
    queryFn: () => listCategories('article'),
  });

  const categories = useMemo(() => {
    const cats = categoriesData?.data;
    if (cats && cats.length > 0) {
      return [
        { value: 'all' as FeedFilter, label: 'All' },
        ...cats.map((c) => ({ value: c.slug as FeedFilter, label: c.name })),
      ];
    }
    return DEFAULT_CATEGORIES;
  }, [categoriesData]);

  // Fetch articles with TanStack Query
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', filter],
    queryFn: () => listArticles(filter !== 'all' ? { category: filter } : undefined),
  });

  const articles = articlesData?.data ?? [];

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="w-full px-6 lg:px-10 pb-10">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FeedFilter)}
            className="mt-2 mb-6 w-full overflow-x-auto md:overflow-visible no-scrollbar"
          >
            <TabsList className="inline-flex min-w-max w-auto justify-start gap-1 bg-transparent p-0 md:justify-center">
              {categories.map(({ value, label }) => (
                <TabsTrigger key={value} className={TAB_TRIGGER_CLASS} value={value}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* === 4-COLUMN ARTICLE GRID === */}
          <section>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No articles found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.map((a) => (
                  <ArticleCardGrid
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    excerpt={a.excerpt}
                    image={a.imageUrl ?? '/images/article-placeholder.jpg'}
                    category={a.category}
                    postedAt={a.publishedAt}
                    likes={0}
                    saves={0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
