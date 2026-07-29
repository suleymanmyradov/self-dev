import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCheckIn, getTodayCheckIns } from '@/api/check-ins';
import type { CreateCheckInRequest, CheckInsResponse, HabitsResponse } from '@/api';
import { toast } from 'sonner';

type CheckInAllVariables = { habitIds: string[] };

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
    onError: (error, _data, context) => {
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
        // No Undo affordance: the backend has no DELETE /check-ins endpoint,
        // so an "Undo" button would be a no-op lie. A plain confirmation toast
        // is honest. If a delete endpoint is added later, reintroduce Undo
        // with a real deleteCheckIn call here.
        toast.success('Checked in');
      }
    },
  });
}

export function useCheckInAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ habitIds }: CheckInAllVariables) => {
      // Submit completed check-ins for every habit in parallel. Use
      // allSettled so one failure (e.g. already checked in) doesn't
      // abort the rest; the caller gets per-habit results to report.
      const results = await Promise.allSettled(
        habitIds.map((habitId) =>
          createCheckIn({ habitId, status: 'completed' } as CreateCheckInRequest),
        ),
      );
      return results;
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
    onSuccess: (results, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      const failed = results.filter((r) => r.status === 'rejected').length;
      const succeeded = variables.habitIds.length - failed;
      if (failed === 0) {
        toast.success(
          `Checked in ${succeeded} habit${succeeded === 1 ? '' : 's'} successfully`,
        );
      } else if (succeeded === 0) {
        toast.error('Failed to check in. You may have already checked in today.');
      } else {
        toast.warning(
          `Checked in ${succeeded} habit${succeeded === 1 ? '' : 's'}, ${failed} already done`,
        );
      }
    },
  });
}
