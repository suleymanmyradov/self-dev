"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ArticleCard, FeaturedCard } from "@/components/explore";
import { Button } from "@/components/ui/button";
import type { Article, Category, SearchResult } from "@/api";
import type { HabitTemplate } from "@/types/explore";
import { cn } from "@/lib/utils";

const SEARCH_RESULT_HREF: Record<SearchResult['type'], (id: string) => string> = {
  article: (id) => `/article/${id}`,
  goal: () => `/plan`,
  habit: () => `/plan`,
  conversation: (id) => `/coach/${id}`,
};

const SEARCH_RESULT_TYPE_LABEL: Record<SearchResult['type'], string> = {
  article: 'Article',
  goal: 'Goal',
  habit: 'Habit',
  conversation: 'Conversation',
};

function SearchResultRow({ result }: { result: SearchResult }) {
  const href = SEARCH_RESULT_HREF[result.type](result.id);
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-[background-color] hover:bg-secondary/50"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
          {SEARCH_RESULT_TYPE_LABEL[result.type]}
        </div>
        <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
        {result.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{result.description}</p>
        )}
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

interface ExploreTabProps {
  articles: Article[];
  featuredArticle: Article | null;
  isSearching: boolean;
  isSearchFetching: boolean;
  trimmedQuery: string;
  category: string;
  setCategory: (category: string) => void;
  categories: Category[];
  searchResults: SearchResult[];
  habitTemplates: HabitTemplate[];
  getIsSaved: (article: Article) => boolean;
  onToggleSave: (articleId: string) => void;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onViewAllTemplates: () => void;
  isSavePending: boolean;
}

export function ExploreTab({
  articles,
  featuredArticle,
  isSearching,
  isSearchFetching,
  trimmedQuery,
  category,
  setCategory,
  categories,
  searchResults,
  habitTemplates,
  getIsSaved,
  onToggleSave,
  onClearSearch,
  onClearCategory,
  onViewAllTemplates,
  isSavePending,
}: ExploreTabProps) {
  // Chips are derived from the DB categories table (passed in from the client,
  // which resolves the SSR-hydrated promise). "All" is always first.
  const categoryChips = [{ id: "all", name: "All" }, ...categories];

  if (isSearching) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-normal text-foreground">Search results</h2>
            <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
              {isSearchFetching
                ? `Searching for “${trimmedQuery}”…`
                : `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"} for “${trimmedQuery}”`}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClearSearch}>
            Clear
          </Button>
        </div>

        {isSearchFetching && searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
            <Search className="mb-4 size-10 animate-pulse text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">Searching…</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <Search className="mb-4 size-10 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium text-foreground">No results for “{trimmedQuery}”</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Try a broader term or browse the curated categories instead.
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onClearSearch}>
              Browse the library
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {searchResults.map((result) => (
              <SearchResultRow key={`${result.type}-${result.id}`} result={result} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Category chips (pill shape, NOT underline) */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {categoryChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setCategory(chip.name)}
            aria-pressed={category === chip.name}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-[color,background-color]",
              category === chip.name
                ? "bg-foreground text-background"
                : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {chip.name}
          </button>
        ))}
      </div>

      {/* Featured article card (hidden while searching) */}
      {featuredArticle && (
        <FeaturedCard
          article={featuredArticle}
          isSaved={getIsSaved(featuredArticle)}
          onToggleSave={() => onToggleSave(featuredArticle.id)}
          isSavePending={isSavePending}
        />
      )}

      {/* Article grid (3 columns) */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Search className="mb-4 size-10 text-muted-foreground opacity-50" />
          <p className="text-sm font-medium text-foreground">No articles in {category}</p>
          <p className="mt-1 text-xs text-muted-foreground">Explore all categories to find something useful.</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onClearCategory}>
            View all articles
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isSaved={getIsSaved(article)}
              onToggleSave={() => onToggleSave(article.id)}
              isSavePending={isSavePending}
            />
          ))}
        </div>
      )}

      {/* Non-article search results (goals, habits, conversations) */}

      {/* Bottom section: habit templates (hidden while searching) */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-normal text-foreground">Habit templates</h3>
          <button
            type="button"
            onClick={onViewAllTemplates}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-[color] hover:text-foreground"
          >
            All {habitTemplates.length}
            <ArrowRight className="size-3" />
          </button>
        </div>
        {habitTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No habit templates are available yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {habitTemplates.slice(0, 4).map((habit) => (
              <button
                key={`${habit.name}-${habit.category}`}
                type="button"
                onClick={onViewAllTemplates}
                className="rounded-lg border border-border p-3 text-left transition-[background-color] hover:bg-secondary/50"
              >
                <p className="text-sm font-medium text-foreground">{habit.name}</p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">Habit · {habit.category}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
