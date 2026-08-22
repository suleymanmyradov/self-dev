"use client";

import { use, useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParamEnum, useSearchParamState } from "@/lib/url-state";
import { useCreateHabit, useCreateGoal, useArticles, useSavedItems, useSavedItemsDetailed, useSaveItem, useRemoveSavedItem, useSearch } from "@/hooks";
import type { ArticlesResponse, CategoriesResponse, ExploreSettings, Article, SavedItemDetailed } from "@/api";
import type { HabitTemplate, GoalTemplate } from "@/types/explore";
import { ExploreTab } from "./explore-tab";
import { SavedTab } from "./saved-tab";
import { TemplatesTab } from "./templates-tab";
import { CommunityTab } from "./community-tab";

interface ExploreClientProps {
  articlesPromise: Promise<ArticlesResponse>;
  categoriesPromise: Promise<CategoriesResponse>;
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

export function ExploreClient({ articlesPromise, categoriesPromise, settings, featuredArticle, habitTemplates, goalTemplates }: ExploreClientProps) {
  // Resolve the server-fetched promise as initialData for the react-query hook.
  // This keeps the library page's article data in the same react-query cache as
  // the home page and article detail page, so optimistic updates from
  // useLikeArticle (and other mutations) propagate here too. staleTime: 0 in
  // useArticles triggers a background refetch with auth so per-user fields
  // (isLiked, isSaved) are correct.
  const initialArticlesData = use(articlesPromise);
  const { data: articlesList = [] } = useArticles(undefined, initialArticlesData);

  // Category chips come from the DB categories table (SSR-hydrated) so the
  // filter list reflects what articles are actually tagged with, not a
  // hardcoded literal.
  const categoriesData = use(categoriesPromise);
  const categories = useMemo(
    () =>
      [...(categoriesData.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [categoriesData],
  );

  const createHabit = useCreateHabit();
  const createGoal = useCreateGoal();

  const [tab, setTab] = useSearchParamEnum("tab", ["explore", "saved", "templates", "community"] as const, "explore");
  const [query, setQuery] = useSearchParamState("q");
  const [category, setCategory] = useState<string>("All");

  const [inputValue, setInputValue] = useState(query);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedInput = useDebounceValue(inputValue, 300);

  // Push debounced input to URL
  useEffect(() => {
    if (debouncedInput !== query) {
      setQuery(debouncedInput);
    }
  }, [debouncedInput, query, setQuery]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        target.tagName !== "SELECT" &&
        !target.isContentEditable
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    if (category === "All") return articlesList;
    return articlesList.filter((article) =>
      article.category?.name?.toLowerCase() === category.toLowerCase(),
    );
  }, [articlesList, category]);

  // Saved items — fetched once at parent level, passed down to cards
  const { data: savedItems, isLoading: isSavedItemsLoading } = useSavedItems({ page: 1, limit: 100 });
  const { data: savedItemsDetailed, isLoading: isSavedDetailsLoading } = useSavedItemsDetailed({ page: 1, limit: 100 });
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
    (savedItemId: string) => removeSavedItem.mutate(savedItemId),
    [removeSavedItem],
  );

  const getIsSaved = useCallback(
    (article: typeof articles[number]) =>
      savedArticleMap.has(article.id) || article.isSaved === true,
    [savedArticleMap]
  );

  const handleToggleSave = useCallback(
    (articleId: string) => {
      const savedItemId = savedArticleMap.get(articleId);
      if (savedItemId) {
        removeSavedItem.mutate(savedItemId);
      } else {
        saveItem.mutate({ itemType: 'article', itemId: articleId });
      }
    },
    [savedArticleMap, saveItem, removeSavedItem]
  );

  const savedCount = savedItems?.length ?? 0;
  const isSavePending = saveItem.isPending || removeSavedItem.isPending;
  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (value.trim()) setTab("explore");
  };
  const handleClearSearch = () => {
    setInputValue("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 md:py-10">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-normal tracking-tight text-foreground">Library</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Curated ideas and practical templates for your next step.
              </p>
            </div>
            {/* Search field */}
            <div className="relative w-full shrink-0 md:w-[340px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                aria-label="Search the library"
                placeholder="Search articles, habits, goals, conversations"
                value={inputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-10 rounded-lg border-border bg-card pl-9 pr-10 text-sm placeholder:text-muted-foreground"
              />
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                /
              </kbd>
            </div>
          </header>

          {/* Tabs (underline style) */}
          <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-6">
              <TabsTrigger value="explore">Explore</TabsTrigger>
              <TabsTrigger value="saved" className="gap-1.5">
                Saved
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{savedCount}</span>
              </TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
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
                categories={categories}
                searchResults={searchResults ?? []}
                habitTemplates={habitTemplates}
                getIsSaved={getIsSaved}
                onToggleSave={handleToggleSave}
                onClearSearch={handleClearSearch}
                onClearCategory={() => setCategory("All")}
                onViewAllTemplates={() => setTab("templates")}
                isSavePending={isSavePending}
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
                onExplore={() => setTab("explore")}
                isLoading={isSavedItemsLoading || isSavedDetailsLoading}
                isRemoving={removeSavedItem.isPending}
              />
            </TabsContent>

            {/* Templates tab */}
            <TabsContent value="templates" className="space-y-6">
              <TemplatesTab
                habitTemplates={habitTemplates}
                goalTemplates={goalTemplates}
                onCreateHabit={(data) => createHabit.mutate(data)}
                onCreateGoal={(data) => createGoal.mutate(data)}
                creatingHabitName={createHabit.isPending ? createHabit.variables?.name : undefined}
                creatingGoalTitle={createGoal.isPending ? createGoal.variables?.title : undefined}
              />
            </TabsContent>

            {/* Community tab */}
            <TabsContent value="community">
              <CommunityTab settings={settings} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
