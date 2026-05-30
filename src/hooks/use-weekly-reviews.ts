import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateWeeklyReview, getCurrentWeeklyReview, getWeeklyReview, listWeeklyReviews } from '@/api/weekly-reviews';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

export function useCurrentWeeklyReview() {
  return useQuery({
    queryKey: ['weeklyReviews', 'current'],
    queryFn: () => getCurrentWeeklyReview(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeeklyReview(weekStart: string) {
  return useQuery({
    queryKey: ['weeklyReviews', weekStart],
    queryFn: () => getWeeklyReview(weekStart),
    select: (data) => data.data,
    enabled: Boolean(weekStart),
  });
}

export function useWeeklyReviews(params = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: ['weeklyReviews', params],
    queryFn: () => listWeeklyReviews(params),
    select: (data) => data.data,
  });
}

export function useGenerateWeeklyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateWeeklyReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyReviews'] });
      toast.success('Weekly review generated successfully');
    },
    onError: handleMutationError,
  });
}
