import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCheckIn, getTodayCheckIns, getCheckInHistory } from '@/api/check-ins';
import type { CreateCheckInRequest } from '@/api';

export function useTodayCheckIns() {
  return useQuery({
    queryKey: ['checkIns', 'today'],
    queryFn: () => getTodayCheckIns(),
    select: (data) => data.data,
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
