"use client";

import { useCallback, useMemo, useState } from "react";
import type { Habit } from "@/api";

export type StatusFilter = 'all' | 'active';
export type SortBy = 'streak' | 'name';

export function useHabitsFilters(habits: Habit[], initialSortBy?: SortBy) {
  // Status filter (pill chips)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  // Category + sort filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy ?? 'streak');

  // Apply filters + sort to a list of habits
  const filterAndSort = useCallback((list: Habit[]): Habit[] => {
    let filtered = list;
    if (statusFilter === 'active') {
      filtered = filtered.filter((h) => !h.completed);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((h) => h.category === categoryFilter);
    }
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [statusFilter, categoryFilter, sortBy]);

  const filteredHabits = useMemo(() => filterAndSort(habits), [filterAndSort, habits]);

  return {
    filteredHabits,
    filterAndSort,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
  };
}
