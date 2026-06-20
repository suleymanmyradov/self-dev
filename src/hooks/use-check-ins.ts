import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCheckIn, getTodayCheckIns } from '@/api/check-ins';
import type { CreateCheckInRequest, CheckInsResponse, HabitsResponse } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

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
      handleMutationError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Check-in submitted successfully');
    },
  });
}
