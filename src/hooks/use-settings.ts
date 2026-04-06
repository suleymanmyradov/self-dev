import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/api/settings';
import type { UpdateSettingsRequest } from '@/api';

/**
 * Hook to fetch user settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
    select: (data) => data.data,
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
