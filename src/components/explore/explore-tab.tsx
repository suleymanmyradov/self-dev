"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { ArticleCard, FeaturedCard } from "@/components/explore";
import type { Article, SearchResult } from "@/api";
import type { HabitTemplate } from "@/types/explore";
import { cn } from "@/lib/utils";

const CATEGORY_CHIPS = [
  "All",
  "Philosophy",
  "Habits",
  "Relationships",
  "Productivity",
  "Self-knowledge",
] as const;

/** Preview data for the "People on the same goal" section. */
const PEOPLE_PREVIEW = [
  { name: "Sarah K.", goal: "Morning meditation" },
  { name: "James L.", goal: "Daily journaling" },
  { name: "Maya R.", goal: "Reading 20 min/day" },
] as const;

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
      className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-[background-color] hover:bg-secondary/50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
        {result.description && (
          <p className="truncate text-xs text-muted-foreground">{result.description}</p>
        )}
      </div>
      <span className="ml-3 shrink-0 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
        {SEARCH_RESULT_TYPE_LABEL[result.type]}
      </span>
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
  nonArticleResults: SearchResult[];
  habitTemplates: HabitTemplate[];
  getIsSaved: (article: Article) => boolean;
  onToggleSave: (articleId: string) => void;
}

export function ExploreTab({
  articles,
  featuredArticle,
  isSearching,
  isSearchFetching,
  trimmedQuery,
  category,
  setCategory,
  nonArticleResults,
  habitTemplates,
  getIsSaved,
  onToggleSave,
}: ExploreTabProps) {
  return (
    <>
      {/* Category chips (pill shape, NOT underline) */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setCategory(chip)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-[color,background-color]",
              category === chip
                ? "bg-foreground text-background"
                : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Featured article card (hidden while searching) */}
      {featuredArticle && !isSearching && (
        <FeaturedCard
          article={featuredArticle}
          isSaved={getIsSaved(featuredArticle)}
          onToggleSave={() => onToggleSave(featuredArticle.id)}
        />
      )}

      {/* Article grid (3 columns) */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="size-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? isSearchFetching
                ? "Searching…"
                : `No results for "${trimmedQuery}"`
              : "No articles available."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isSaved={getIsSaved(article)}
              onToggleSave={() => onToggleSave(article.id)}
            />
          ))}
        </div>
      )}

      {/* Non-article search results (goals, habits, conversations) */}
      {isSearching && nonArticleResults.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            More results
          </p>
          {nonArticleResults.map((r) => (
            <SearchResultRow key={`${r.type}-${r.id}`} result={r} />
          ))}
        </div>
      )}

      {/* Bottom section: habit templates + people (hidden while searching) */}
      {!isSearching && (
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        {/* Habit templates card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-normal text-foreground">Habit templates</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground">
              All {habitTemplates.length}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {habitTemplates.slice(0, 4).map((habit) => (
              <div
                key={habit.name}
                className="rounded-lg border border-border p-3"
              >
                <p className="text-sm font-medium text-foreground">{habit.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  3 habits · {habit.category}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* People on the same goal card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-lg font-normal text-foreground">
            People on the same goal
          </h3>
          <div className="space-y-3">
            {PEOPLE_PREVIEW.map((person) => (
              <div key={person.name} className="flex items-center gap-3">
                <div className="size-[30px] shrink-0 rounded-full bg-secondary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{person.goal}</p>
                </div>
                <button className="text-xs text-success hover:text-success/80">Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </>
  );
}
