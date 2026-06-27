import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/api/settings';
import type { UpdateSettingsRequest, SettingsResponse } from '@/api';
import { toast } from 'sonner';

/**
 * Hook to fetch user settings
 */
export function useSettings(initialData?: SettingsResponse) {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
    select: (data) => data.data,
    initialData,
    staleTime: 10 * 60 * 1000, // 10 minutes — settings rarely change
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
      toast.success('Settings updated successfully');
    },
  });
}
