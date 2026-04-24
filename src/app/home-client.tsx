'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArticleCardGrid } from '@/components/home/article-card-grid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFeedFilter } from '@/store/feed-filter';
import type { FeedFilter } from '@/store/feed-filter';
import { listCategories, listArticles } from '@/api';

const TAB_TRIGGER_CLASS =
  'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold';

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
      const mapped = [
        { value: 'all' as FeedFilter, label: 'All' },
        ...cats.map((c) => ({ value: c.slug as FeedFilter, label: c.name })),
      ];
      return mapped;
    }
    return DEFAULT_CATEGORIES;
  }, [categoriesData]);

  // Fetch articles with TanStack Query
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', filter],
    queryFn: () => {
      const params = filter !== 'all' ? { category: filter } : undefined;
      return listArticles(params);
    },
  });

  const articles = articlesData?.data ?? [];

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Ambient background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-ambient-calm opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-ambient-growth opacity-15 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="w-full px-6 lg:px-10 pb-10">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FeedFilter)}
            className="mt-2 mb-6 w-full"
          >
            <TabsList className="h-auto w-fit bg-secondary/50 p-1 rounded-lg">
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
                <p className="text-muted-foreground animate-pulse">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-muted-foreground text-sm">No articles found</p>
                <p className="text-muted-foreground/60 text-xs">Try selecting a different category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.map((a, i) => (
                  <ArticleCardGrid
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    excerpt={a.excerpt}
                    image={a.imageUrl ?? '/images/article-placeholder.svg'}
                    category={a.category?.name}
                    postedAt={a.publishedAt}
                    likes={0}
                    saves={0}
                    index={i}
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
