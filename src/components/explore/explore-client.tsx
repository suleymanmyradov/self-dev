"use client";

import { use, useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  ArticleCard,
  FeaturedCard,
  HabitTemplateCard,
  GoalTemplateCard,
  CommunityCard,
} from "@/components/explore";
import { HABIT_TEMPLATES, GOAL_TEMPLATES } from "@/data/templates";
import { useSearchParamState } from "@/lib/url-state";
import { useCreateHabit, useCreateGoal, useSavedItems, useSaveItem, useRemoveSavedItem } from "@/hooks";
import { toast } from "@/components/ui/sonner";
import type { ArticlesResponse } from "@/api";

interface ExploreClientProps {
  articlesPromise: Promise<ArticlesResponse>;
}

function useDebounceValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function ExploreClient({ articlesPromise }: ExploreClientProps) {
  const articlesData = use(articlesPromise);

  const createHabit = useCreateHabit().mutate;
  const createGoal = useCreateGoal().mutate;

  const [tab, setTab] = useSearchParamState("tab", "articles");
  const [query, setQuery] = useSearchParamState("q");

  const [inputValue, setInputValue] = useState(query);
  const debouncedInput = useDebounceValue(inputValue, 300);

  // Push debounced input to URL
  useEffect(() => {
    if (debouncedInput !== query) {
      setQuery(debouncedInput);
    }
  }, [debouncedInput, query, setQuery]);

  const articles = useMemo(() => {
    const allArticles = articlesData.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return allArticles;
    return allArticles.filter((a) =>
      [a.title, a.excerpt, a.category?.name].some((f) =>
        f?.toLowerCase()?.includes(q),
      ),
    );
  }, [query, articlesData]);

  // Saved items — fetched once at parent level, passed down to cards
  const { data: savedItems } = useSavedItems({ page: 1, limit: 100 });
  const saveItem = useSaveItem();
  const removeSavedItem = useRemoveSavedItem();

  const savedArticleMap = useMemo(() => {
    const map = new Map<string, string>();
    savedItems?.forEach((item) => {
      if (item.itemType === 'article') {
        map.set(item.itemId, item.id);
      }
    });
    return map;
  }, [savedItems]);

  const getIsSaved = useCallback(
    (article: typeof articles[number]) => {
      if (article.isSaved !== undefined) return article.isSaved;
      return savedArticleMap.has(article.id);
    },
    [savedArticleMap]
  );

  const handleToggleSave = useCallback(
    async (articleId: string) => {
      const savedItemId = savedArticleMap.get(articleId);

      if (savedItemId) {
        try {
          await removeSavedItem.mutateAsync(savedItemId);
          toast.success('Article removed from saved');
        } catch {
          toast.error('Failed to remove article');
        }
      } else {
        try {
          await saveItem.mutateAsync({ itemType: 'article', itemId: articleId });
          toast.success('Article saved');
        } catch {
          toast.error('Failed to save article');
        }
      }
    },
    [savedArticleMap, saveItem, removeSavedItem]
  );

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
              {(["articles", "habits", "goals", "community"] as const).map((tabValue) => (
                <TabsTrigger key={tabValue} value={tabValue}>
                  {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Articles */}
            <TabsContent value="articles" className="space-y-6">
              <FeaturedCard />
              {articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {query.trim() ? `No results for "${query.trim()}"` : "No articles available."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      isSaved={getIsSaved(article)}
                      onToggleSave={() => handleToggleSave(article.id)}
                    />
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
                    onAdd={(data) => createHabit(data)}
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
                    onAdd={(data) => createGoal(data)}
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
