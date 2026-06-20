import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listHabits, getHabit, createHabit, updateHabit, deleteHabit, resetTodayHabits } from '@/api';
import type { CreateHabitRequest, UpdateHabitRequest, HabitsResponse, Habit } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

// The API caps `limit` at 100 (see PageParamsSchema). To avoid silently
// truncating users with >100 habits, the list query fetches every page and
// concatenates the results into a single list. The returned `page` metadata
// reflects the totals from the first page.
async function listAllHabits(): Promise<HabitsResponse> {
  const limit = 100;
  const first = await listHabits({ page: 1, limit });
  if (first.data.length >= first.page.total) {
    return first;
  }
  const all: Habit[] = [...first.data];
  const totalPages = first.page.totalPages;
  for (let page = 2; page <= totalPages; page++) {
    const res = await listHabits({ page, limit });
    all.push(...res.data);
    if (all.length >= first.page.total) break;
  }
  return { data: all, page: first.page };
}

/**
 * Hook to fetch all habits (paginated under the hood so >100 habits are not
 * silently truncated).
 */
export function useHabits(_params?: { page?: number; limit?: number }, initialData?: HabitsResponse) {
  return useQuery({
    queryKey: ['habits', 'list'],
    queryFn: () => listAllHabits(),
    select: (data) => data.data,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes — mutations invalidate cache
  });
}

/**
 * Hook to fetch a single habit
 */
export function useHabit(id: string) {
  return useQuery({
    queryKey: ['habits', 'detail', id],
    queryFn: () => getHabit(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Hook to create a new habit
 */
export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHabitRequest) => createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit created successfully');
    },
    onError: handleMutationError,
  });
}

/**
 * Hook to update a habit
 */
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitRequest }) => updateHabit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', 'detail', variables.id] });
      toast.success('Habit updated successfully');
    },
    onError: handleMutationError,
  });
}

/**
 * Hook to delete a habit
 *
 * Uses an optimistic update to immediately remove the habit from every cached
 * habits list query, then invalidates related queries to ensure fresh data.
 * If the server rejects the deletion, the cache is rolled back. The optimistic
 * update matches any ['habits','list',...] query (regardless of page/limit) so
 * it stays correct if the list query params change.
 */
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onMutate: async (id: string) => {
      // Cancel in-flight list queries so they don't overwrite our optimistic update.
      await queryClient.cancelQueries({ queryKey: ['habits', 'list'] });

      // Snapshot every cached habits list query so we can roll back on error.
      const previous = queryClient.getQueriesData<HabitsResponse>({ queryKey: ['habits', 'list'] });

      // Optimistically remove the habit from every cached list query.
      queryClient.setQueriesData<HabitsResponse | undefined>(
        { queryKey: ['habits', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((h) => h.id !== id),
            page: {
              ...old.page,
              total: Math.max(0, old.page.total - 1),
            },
          };
        },
      );

      return { previous };
    },
    onError: (error, _id, context) => {
      // Roll back to the snapshots on error.
      if (context?.previous) {
        for (const [key, value] of context.previous) {
          queryClient.setQueryData(key, value);
        }
      }
      handleMutationError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Habit deleted successfully');
    },
  });
}

/**
 * Hook to reset all habits for today
 */
export function useResetTodayHabits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetTodayHabits(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      toast.success('Habits reset for today');
    },
    onError: handleMutationError,
  });
}
