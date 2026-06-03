"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParamState } from "@/lib/url-state";
import { useCreateHabit } from "@/hooks/use-habits";
import { useCreateGoal } from "@/hooks/use-goals";
import { useDebounceValue } from "@/hooks/use-debounce";
import { listArticles } from "@/api";
import type { ArticlesResponse } from "@/api";

interface UseExploreReturn {
  tab: string;
  setTab: (value: string) => void;
  query: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  articles: ArticlesResponse["data"];
  isLoading: boolean;
  createHabit: ReturnType<typeof useCreateHabit>["mutate"];
  createGoal: ReturnType<typeof useCreateGoal>["mutate"];
}

export function useExplore(initialArticles?: ArticlesResponse): UseExploreReturn {
  const createHabitMutation = useCreateHabit();
  const createGoalMutation = useCreateGoal();

  const [tab, setTab] = useSearchParamState("tab", "articles");
  const [query, setQuery] = useSearchParamState("q");

  // Local input for responsiveness; sync to URL after debounce
  const [inputValue, setInputValue] = useState(query);
  const debouncedInput = useDebounceValue(inputValue, 300);

  // Push debounced input to URL
  useEffect(() => {
    if (debouncedInput !== query) {
      setQuery(debouncedInput);
    }
  }, [debouncedInput, query, setQuery]);

  // Sync input from URL on external changes (back/forward, bookmark).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue((prev) => {
      if (query !== prev) return query;
      return prev;
    });
  }, [query]);

  // Fetch real articles from API
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["articles", "explore"],
    queryFn: () => listArticles({ limit: 20 }),
    initialData: initialArticles,
  });

  const filteredArticles = useMemo(() => {
    const articles = articlesData?.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      [a.title, a.excerpt, a.category?.name].some((f) =>
        f?.toLowerCase().includes(q),
      ),
    );
  }, [query, articlesData]);

  return {
    tab,
    setTab,
    query,
    inputValue,
    setInputValue,
    articles: filteredArticles,
    isLoading,
    createHabit: createHabitMutation.mutate,
    createGoal: createGoalMutation.mutate,
  };
}
