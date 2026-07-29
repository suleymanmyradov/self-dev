"use client";

import { use, useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParamState } from "@/lib/url-state";
import { useCreateHabit, useCreateGoal, useSavedItems, useSavedItemsDetailed, useSaveItem, useRemoveSavedItem, useSearch } from "@/hooks";
import { toast } from "@/components/ui/sonner";
import type { ArticlesResponse, ExploreSettings, Article, SavedItemDetailed, SearchResult } from "@/api";
import type { HabitTemplate, GoalTemplate } from "@/types/explore";
import { ExploreTab } from "./explore-tab";
import { SavedTab } from "./saved-tab";
import { TemplatesTab } from "./templates-tab";
import { CommunityTab } from "./community-tab";

interface ExploreClientProps {
  articlesPromise: Promise<ArticlesResponse>;
  settings: ExploreSettings;
  featuredArticle: Article | null;
  habitTemplates: HabitTemplate[];
  goalTemplates: GoalTemplate[];
}

function useDebounceValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function ExploreClient({ articlesPromise, settings, featuredArticle, habitTemplates, goalTemplates }: ExploreClientProps) {
  const articlesData = use(articlesPromise);

  const createHabit = useCreateHabit().mutate;
  const createGoal = useCreateGoal().mutate;

  const [tab, setTab] = useSearchParamState("tab", "explore");
  const [query, setQuery] = useSearchParamState("q");
  const [category, setCategory] = useState<string>("All");

  const [inputValue, setInputValue] = useState(query);
  const debouncedInput = useDebounceValue(inputValue, 300);

  // Push debounced input to URL
  useEffect(() => {
    if (debouncedInput !== query) {
      setQuery(debouncedInput);
    }
  }, [debouncedInput, query, setQuery]);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  // Server-side cross-entity search (articles, goals, habits, conversations).
  // Falls back to the local article list (with category filter) when no query.
  const { data: searchResults, isFetching: isSearchFetching } = useSearch({
    q: trimmedQuery,
    page: 1,
    limit: 30,
  });

  const articles = useMemo(() => {
    const allArticles = articlesData.data ?? [];
    if (!isSearching) {
      let filtered = allArticles;
      if (category !== "All") {
        filtered = filtered.filter((a) =>
          a.category?.name?.toLowerCase() === category.toLowerCase(),
        );
      }
      return filtered;
    }
    // Map article-type search results back to Article objects from the loaded
    // list (so images/category/save state resolve). Results not in the loaded
    // list are surfaced separately via nonArticleResults below.
    const byId = new Map(allArticles.map((a) => [a.id, a]));
    return (searchResults ?? [])
      .filter((r) => r.type === 'article')
      .map((r) => byId.get(r.id))
      .filter((a): a is Article => !!a);
  }, [isSearching, searchResults, articlesData, category]);

  const nonArticleResults = useMemo<SearchResult[]>(
    () => (isSearching ? (searchResults ?? []).filter((r) => r.type !== 'article') : []),
    [isSearching, searchResults],
  );

  // Saved items — fetched once at parent level, passed down to cards
  const { data: savedItems } = useSavedItems({ page: 1, limit: 100 });
  const { data: savedItemsDetailed } = useSavedItemsDetailed({ page: 1, limit: 100 });
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

  const savedArticles = useMemo(() => {
    return (savedItemsDetailed ?? [])
      .filter((item): item is SavedItemDetailed & { article: Article } =>
        item.itemType === 'article' && !!item.article,
      )
      .map(item => item.article);
  }, [savedItemsDetailed]);

  const savedHabits = useMemo(() => {
    return (savedItemsDetailed ?? [])
      .filter((item): item is SavedItemDetailed & { habit: NonNullable<typeof item.habit> } =>
        item.itemType === 'habit' && !!item.habit,
      )
      .map(item => ({ habit: item.habit, savedItemId: item.id }));
  }, [savedItemsDetailed]);

  const savedGoals = useMemo(() => {
    return (savedItemsDetailed ?? [])
      .filter((item): item is SavedItemDetailed & { goal: NonNullable<typeof item.goal> } =>
        item.itemType === 'goal' && !!item.goal,
      )
      .map(item => ({ goal: item.goal, savedItemId: item.id }));
  }, [savedItemsDetailed]);

  const handleRemoveSavedById = useCallback(
    async (savedItemId: string) => {
      try {
        await removeSavedItem.mutateAsync(savedItemId);
        toast.success('Removed from saved');
      } catch {
        toast.error('Failed to remove item');
      }
    },
    [removeSavedItem],
  );

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

  const savedCount = savedArticleMap.size;

  return (
    <div className="h-full flex flex-col relative">
      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 md:py-10">
          {/* Header */}
          <header className="mb-8 flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-normal tracking-tight text-foreground">Library</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Reading, habit templates, and the people doing the same work.
              </p>
            </div>
            {/* Search field */}
            <div className="relative hidden w-[300px] shrink-0 md:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles, templates, people"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-9 rounded-lg border-border bg-card pl-9 pr-10 text-sm placeholder:text-muted-foreground"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                /
              </kbd>
            </div>
          </header>

          {/* Tabs (underline style) */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-6">
              <TabsTrigger value="explore">Explore</TabsTrigger>
              <TabsTrigger value="saved" className="gap-1.5">
                Saved
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{savedCount}</span>
              </TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>

            {/* Explore tab */}
            <TabsContent value="explore" className="space-y-6">
              <ExploreTab
                articles={articles}
                featuredArticle={featuredArticle}
                isSearching={isSearching}
                isSearchFetching={isSearchFetching}
                trimmedQuery={trimmedQuery}
                category={category}
                setCategory={setCategory}
                nonArticleResults={nonArticleResults}
                habitTemplates={habitTemplates}
                getIsSaved={getIsSaved}
                onToggleSave={handleToggleSave}
              />
            </TabsContent>

            {/* Saved tab */}
            <TabsContent value="saved" className="space-y-6">
              <SavedTab
                savedArticles={savedArticles}
                savedHabits={savedHabits}
                savedGoals={savedGoals}
                onToggleSave={handleToggleSave}
                onRemoveSavedById={handleRemoveSavedById}
              />
            </TabsContent>

            {/* Templates tab */}
            <TabsContent value="templates" className="space-y-6">
              <TemplatesTab
                habitTemplates={habitTemplates}
                goalTemplates={goalTemplates}
                onCreateHabit={(data) => createHabit(data)}
                onCreateGoal={(data) => createGoal(data)}
              />
            </TabsContent>

            {/* People tab */}
            <TabsContent value="people">
              <CommunityTab settings={settings} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
