"use client";

import { useCallback, useMemo, useState } from "react";
import type { Habit } from "@/api";

export type StatusFilter = 'all' | 'active' | 'paused' | 'archived';

export function useHabitsFilters(habits: Habit[]) {
  // Status filter (pill chips)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  // Category + sort filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'streak' | 'name'>('streak');

  // Apply filters + sort to a list of habits
  const filterAndSort = useCallback((list: Habit[]): Habit[] => {
    let filtered = list;
    if (statusFilter === 'active') {
      filtered = filtered.filter((h) => !h.completed);
    } else if (statusFilter === 'paused' || statusFilter === 'archived') {
      // No "paused"/"archived" status on habits yet — show empty for those filters
      filtered = [];
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
