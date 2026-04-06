import { useMemo, useState } from 'react';
import type { Habit } from '@/api';

export type SortBy = 'streak' | 'name';

export function useHabitFilters(habits: Habit[]) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('streak');

  const visibleHabits = useMemo(() => {
    const filtered = categoryFilter === 'all' 
      ? habits 
      : habits.filter(h => h.category === categoryFilter);
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak;
      return a.name.localeCompare(b.name);
    });
    
    return sorted;
  }, [habits, categoryFilter, sortBy]);

  const completionPct = useMemo(() => {
    if (habits.length === 0) return 0;
    const done = habits.filter(h => h.completed).length;
    return Math.round((done / habits.length) * 100);
  }, [habits]);

  return {
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    visibleHabits,
    completionPct,
  };
}
