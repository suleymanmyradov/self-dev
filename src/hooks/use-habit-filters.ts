import { useMemo, useState } from 'react';
import type { Habit } from '@/api';

export type SortBy = 'streak' | 'name';

export function useHabitFilters(habits: Habit[]) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('streak');

  const visibleHabits = useMemo(() => {
    const safeHabits = habits || [];
    const filtered = categoryFilter === 'all' 
      ? safeHabits 
      : safeHabits.filter(h => h.category === categoryFilter);
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak;
      return a.name.localeCompare(b.name);
    });
    
    return sorted;
  }, [habits, categoryFilter, sortBy]);

  const completionPct = useMemo(() => {
    const safeHabits = habits || [];
    if (safeHabits.length === 0) return 0;
    const done = safeHabits.filter(h => h.completed).length;
    return Math.round((done / safeHabits.length) * 100);
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
