import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateWeeklyReview, getCurrentWeeklyReview, getWeeklyReview, listWeeklyReviews } from '@/api/weekly-reviews';
import type { ApiResponse, WeeklyReview } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

export function useCurrentWeeklyReview(initialData?: ApiResponse<WeeklyReview | null>) {
  return useQuery({
    queryKey: ['weeklyReviews', 'current'],
    queryFn: () => getCurrentWeeklyReview(),
    select: (data) => data.data,
    initialData,
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

const DEFAULT_WEEKLY_REVIEWS_PARAMS = { page: 1, limit: 10 };

export function useWeeklyReviews(params = DEFAULT_WEEKLY_REVIEWS_PARAMS, initialData?: ApiResponse<WeeklyReview[]>) {
  const { page, limit } = params;
  return useQuery({
    queryKey: ['weeklyReviews', page ?? 1, limit ?? 10],
    queryFn: () => listWeeklyReviews({ page, limit }),
    select: (data) => data.data,
    initialData,
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
