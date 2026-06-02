"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useCreateHabit, useCreateGoal } from "@/hooks";
import { listArticles } from "@/api";
import { HABIT_TEMPLATES, GOAL_TEMPLATES } from "@/data/templates";
import type { ArticlesResponse } from "@/api";
import {
  ArticleCard,
  FeaturedCard,
  HabitTemplateCard,
  GoalTemplateCard,
  CommunityCard,
} from "@/components/explore";
import { useSearchParamState } from "@/lib/url-state";

interface ExploreClientProps {
  initialArticles?: ArticlesResponse;
}

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function ExploreClient({ initialArticles }: ExploreClientProps) {
  const createHabitMutation = useCreateHabit();
  const createGoalMutation = useCreateGoal();

  const [tab, setTab] = useSearchParamState("tab", "articles");
  const [urlQuery, setUrlQuery] = useSearchParamState("q");

  // Local input state for responsiveness; sync to URL after debounce
  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedInput = useDebounceValue(inputValue, 300);

  // Push debounced input to URL
  useEffect(() => {
    if (debouncedInput !== urlQuery) {
      setUrlQuery(debouncedInput);
    }
  }, [debouncedInput, urlQuery, setUrlQuery]);

  // Sync input from URL on external changes (back/forward, bookmark)
  useEffect(() => {
    setInputValue((prev) => {
      if (urlQuery !== prev) return urlQuery;
      return prev;
    });
  }, [urlQuery]);

  const query = urlQuery;

  // Fetch real articles from API
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', 'explore'],
    queryFn: () => listArticles({ limit: 20 }),
    initialData: initialArticles,
  });

  const articles = articlesData?.data ?? [];

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      [a.title, a.excerpt, a.category?.name].some((f) => f?.toLowerCase().includes(q)),
    );
  }, [query, articles]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-ambient-calm opacity-25 blur-3xl" />
        <div className="absolute bottom-20 -right-20 h-64 w-64 rounded-full bg-ambient-growth opacity-20 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
          {/* Header */}
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Explore</h1>
            <p className="mt-1 text-sm text-muted-foreground">Discover content to inspire your growth journey.</p>
          </header>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles, habits, goals..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10 bg-background/80 backdrop-blur"
              />
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto">
              {(['articles', 'habits', 'goals', 'community'] as const).map((tabValue) => (
                <TabsTrigger key={tabValue} value={tabValue}>
                  {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Articles */}
            <TabsContent value="articles" className="space-y-6">
              <FeaturedCard />
              {articlesLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {query.trim() ? `No results for "${query.trim()}"` : 'No articles available.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Habits */}
            <TabsContent value="habits">
              <div className="grid gap-4 md:grid-cols-2">
                {HABIT_TEMPLATES.map((habit) => (
                  <HabitTemplateCard
                    key={habit.name}
                    template={habit}
                    onAdd={(data) => createHabitMutation.mutate(data)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Goals */}
            <TabsContent value="goals">
              <div className="grid gap-4 md:grid-cols-2">
                {GOAL_TEMPLATES.map((goal) => (
                  <GoalTemplateCard
                    key={goal.title}
                    template={goal}
                    onAdd={(data) => createGoalMutation.mutate(data)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Community */}
            <TabsContent value="community">
              <CommunityCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
