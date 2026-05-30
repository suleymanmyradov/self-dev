import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCheckIn, getTodayCheckIns } from '@/api/check-ins';
import type { CreateCheckInRequest, CheckInsResponse } from '@/api';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
