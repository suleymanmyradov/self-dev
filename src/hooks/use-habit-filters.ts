import { useMemo } from 'react';
import type { Habit } from '@/api';
import { useSearchParamState } from '@/lib/url-state';

export type SortBy = 'streak' | 'name';

export function useHabitFilters(habits: Habit[]) {
  const [categoryFilter, setCategoryFilter] = useSearchParamState('category', 'all');
  const [sortBy, setSortBy] = useSearchParamState('sort', 'streak');

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
