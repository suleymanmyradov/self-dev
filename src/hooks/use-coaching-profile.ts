import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoachingProfile, updateCoachingProfilePreferences } from '../api';
import type { UpdateCoachingProfilePreferencesRequest } from '../api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

export function useCoachingProfile() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['coachingProfile'],
    queryFn: () => getCoachingProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: UpdateCoachingProfilePreferencesRequest) => updateCoachingProfilePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachingProfile'] });
      toast.success('Coaching preferences updated');
    },
  });

  return {
    profile: profile ?? null,
    loading,
    error: isError ? (queryError instanceof ApiError ? queryError.message : 'Failed to load coaching profile') : null,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    refresh: refetch,
  };
}
