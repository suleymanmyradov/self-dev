import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPersonalizationContext, generatePersonalizedCoaching } from '../api';
import type { GeneratePersonalizedCoachingRequest } from '../api';

export function usePersonalization(autoLoad = true) {
  const queryClient = useQueryClient();

  const { data: context, isLoading: loading, error } = useQuery({
    queryKey: ['personalization', 'context'],
    queryFn: () => getPersonalizationContext(false),
    enabled: autoLoad,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const generateCoachingMutation = useMutation({
    mutationFn: (request: GeneratePersonalizedCoachingRequest) => generatePersonalizedCoaching(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalization', 'context'] });
    },
  });

  const generateCoaching = async (request: GeneratePersonalizedCoachingRequest) => {
    return generateCoachingMutation.mutateAsync(request);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['personalization', 'context'] });
  };

  return {
    context,
    loading,
    error: error instanceof Error ? error.message : null,
    generateCoaching,
    refresh,
  };
}