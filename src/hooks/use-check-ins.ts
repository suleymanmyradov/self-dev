import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCheckIn, deleteCheckIn, getTodayCheckIns } from '@/api/check-ins';
import { listAllHabits } from '@/hooks/use-habits';
import type { CreateCheckInRequest, CheckInsResponse, HabitsResponse, ApiResponse, CreateCheckInResponseData } from '@/api';
import { toast } from 'sonner';

// Checks if an API error is a specific status code (e.g. 409, 404).
function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { code?: string } } }).response?.data?.code === 'string' &&
    (error as { response: { data: { code: string } } }).response.data.code === code
  );
}

type CheckInAllVariables = { habitIds: string[] };

type CheckInAllResult = {
  results: PromiseSettledResult<ApiResponse<CreateCheckInResponseData>>[];
  alreadyDone: number;
};

type CheckInAllContext = {
  previous: [import('@tanstack/react-query').QueryKey, HabitsResponse | undefined][];
};

export function useTodayCheckIns(initialData?: CheckInsResponse) {
  return useQuery({
    queryKey: ['checkIns', 'today'],
    queryFn: () => getTodayCheckIns(),
    select: (data) => data.data,
    initialData,
    staleTime: 2 * 60 * 1000, // 2 minutes — mutations invalidate cache
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCheckInRequest) => createCheckIn(data),
    onMutate: async (data: CreateCheckInRequest) => {
      // Optimistically reflect a 'completed' check-in in the habits list so the
      // card flips to "Done Today" immediately, without waiting for a full
      // refetch of up to 100 habits. Streak is bumped locally; the server
      // recomputes the authoritative (history-derived) streak on invalidate.
      if (data.status !== 'completed') return {};
      await queryClient.cancelQueries({ queryKey: ['habits', 'list'] });
      const previous = queryClient.getQueriesData<HabitsResponse>({ queryKey: ['habits', 'list'] });
      queryClient.setQueriesData<HabitsResponse | undefined>(
        { queryKey: ['habits', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((h) =>
              h.id === data.habitId
                ? { ...h, completed: true, streak: h.streak + 1 }
                : h,
            ),
          };
        },
      );
      return { previous };
    },
    onError: (error, data, context) => {
      // 409 "already_exists" means the check-in already succeeded (e.g. from
      // another tab or a race). Don't roll back the optimistic update —
      // invalidate to get the authoritative state and show a friendly message.
      if (hasErrorCode(error, 'already_exists')) {
        queryClient.invalidateQueries({ queryKey: ['checkIns'] });
        queryClient.invalidateQueries({ queryKey: ['habits'] });
        if (data.status === 'completed') {
          toast.info('Already checked in today');
        }
        return;
      }
      // Real error — roll back the optimistic update.
      if (context?.previous) {
        for (const [key, value] of context.previous) {
          queryClient.setQueryData(key, value);
        }
      }
      toast.error('Check-in failed. Please try again.');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      if (variables.status === 'completed') {
        toast.success('Checked in');
      }
    },
  });
}

export function useDeleteCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (habitId: string) => deleteCheckIn(habitId),
    onMutate: async (habitId: string) => {
      // Optimistically revert the habit to not-completed and decrement streak.
      await queryClient.cancelQueries({ queryKey: ['habits', 'list'] });
      const previous = queryClient.getQueriesData<HabitsResponse>({ queryKey: ['habits', 'list'] });
      queryClient.setQueriesData<HabitsResponse | undefined>(
        { queryKey: ['habits', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((h) =>
              h.id === habitId
                ? { ...h, completed: false, streak: Math.max(0, h.streak - 1) }
                : h,
            ),
          };
        },
      );
      return { previous };
    },
    onError: (error, _habitId, context) => {
      // 404 "not_found" means there was no check-in to undo (e.g. already
      // undone from another tab). Don't roll back — the optimistic state
      // (not completed) is already correct.
      if (hasErrorCode(error, 'not_found')) {
        queryClient.invalidateQueries({ queryKey: ['checkIns'] });
        queryClient.invalidateQueries({ queryKey: ['habits'] });
        toast.info('Already undone');
        return;
      }
      // Real error — roll back the optimistic update.
      if (context?.previous) {
        for (const [key, value] of context.previous) {
          queryClient.setQueryData(key, value);
        }
      }
      toast.error('Failed to undo check-in. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Check-in undone');
    },
  });
}

export function useCheckInAll() {
  const queryClient = useQueryClient();
  return useMutation<CheckInAllResult, Error, CheckInAllVariables, CheckInAllContext>({
    mutationFn: async ({ habitIds }: CheckInAllVariables) => {
      // Refetch habits to get fresh `completed` flags before sending any
      // check-in requests. Without this, a stale cache (e.g. checked in from
      // another tab/session) would cause 409 "already exists" errors that
      // spam the console with stack traces even though useCheckInAll handles
      // them gracefully via allSettled.
      const fresh = await listAllHabits();
      const completedSet = new Set(fresh.data.filter((h) => h.completed).map((h) => h.id));
      const toCheckIn = habitIds.filter((id) => !completedSet.has(id));
      const alreadyDone = habitIds.length - toCheckIn.length;

      if (toCheckIn.length === 0) {
        return { results: [], alreadyDone };
      }

      // Submit completed check-ins for every still-pending habit in parallel.
      // Use allSettled so one failure (e.g. a race-condition 409) doesn't
      // abort the rest; the caller gets per-habit results to report.
      const results = await Promise.allSettled(
        toCheckIn.map((habitId) =>
          createCheckIn({ habitId, status: 'completed' } as CreateCheckInRequest),
        ),
      );
      return { results, alreadyDone };
    },
    onMutate: async ({ habitIds }: CheckInAllVariables) => {
      // Optimistically flip every habit to completed + bump streaks so
      // the cards update instantly without waiting for N round-trips.
      await queryClient.cancelQueries({ queryKey: ['habits', 'list'] });
      const previous = queryClient.getQueriesData<HabitsResponse>({ queryKey: ['habits', 'list'] });
      const completedSet = new Set(habitIds);
      queryClient.setQueriesData<HabitsResponse | undefined>(
        { queryKey: ['habits', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((h) =>
              completedSet.has(h.id)
                ? { ...h, completed: true, streak: h.streak + 1 }
                : h,
            ),
          };
        },
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        for (const [key, value] of context.previous) {
          queryClient.setQueryData(key, value);
        }
      }
    },
    onSuccess: ({ results, alreadyDone }) => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      const failed = results.filter((r) => r.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (failed === 0) {
        if (alreadyDone > 0 && succeeded === 0) {
          toast.info(`All ${alreadyDone} habit${alreadyDone === 1 ? '' : 's'} already checked in today`);
        } else if (alreadyDone > 0) {
          toast.success(
            `Checked in ${succeeded} habit${succeeded === 1 ? '' : 's'}, ${alreadyDone} already done`,
          );
        } else {
          toast.success(
            `Checked in ${succeeded} habit${succeeded === 1 ? '' : 's'} successfully`,
          );
        }
      } else if (succeeded === 0 && alreadyDone === 0) {
        toast.error('Failed to check in. Please try again.');
      } else {
        toast.warning(
          `Checked in ${succeeded} habit${succeeded === 1 ? '' : 's'}, ${failed} failed, ${alreadyDone} already done`,
        );
      }
    },
  });
}
