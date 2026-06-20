import { useQuery } from '@tanstack/react-query';
import { listCategories } from '@/api';
import type { EntityType, Category } from '@/api';

/**
 * Fetch the list of categories from the DB. The categories table is the
 * single source of truth for category slugs — the frontend no longer hardcodes
 * a fixed enum. `entityType` is accepted by the API but currently ignored
 * server-side (categories are a shared pool); pass 'habit' for clarity.
 */
export function useCategories(entityType: EntityType = 'habit') {
  return useQuery({
    queryKey: ['categories', entityType],
    queryFn: () => listCategories(entityType),
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000, // 10 minutes — categories rarely change
  });
}

/**
 * Convenience selector returning just the slugs, sorted by sortOrder.
 */
export function useCategorySlugs(entityType: EntityType = 'habit'): string[] {
  const { data } = useCategories(entityType);
  if (!data) return [];
  return [...data]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c: Category) => c.slug);
}
