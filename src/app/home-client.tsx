'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArticleCardGrid } from '@/components/home/article-card-grid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFeedFilter } from '@/store/feed-filter';
import type { FeedFilter } from '@/store/feed-filter';
import { listCategories, listArticles } from '@/api';

const TAB_TRIGGER_CLASS =
  'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm';

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
    console.log('Raw categories from API:', cats);
    if (cats && cats.length > 0) {
      const mapped = [
        { value: 'all' as FeedFilter, label: 'All' },
        ...cats.map((c) => ({ value: c.slug as FeedFilter, label: c.name })),
      ];
      console.log('Mapped categories:', mapped);
      return mapped;
    }
    console.log('Using default categories');
    return DEFAULT_CATEGORIES;
  }, [categoriesData]);

  // Fetch articles with TanStack Query
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', filter],
    queryFn: () => {
      console.log('Fetching articles with filter:', filter);
      const params = filter !== 'all' ? { category: filter } : undefined;
      console.log('API params:', params);
      return listArticles(params);
    },
  });

  const articles = articlesData?.data ?? [];

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
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
                    image={a.imageUrl ?? '/images/article-placeholder.svg'}
                    category={a.category?.name}
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
