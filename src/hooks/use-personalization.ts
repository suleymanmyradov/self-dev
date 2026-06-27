import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPersonalizationContext, generatePersonalizedCoaching } from '../api';
import type { GeneratePersonalizedCoachingRequest } from '../api';
import { ApiError } from '@/api/axios-client';

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

  const generateCoaching = useCallback(async (request: GeneratePersonalizedCoachingRequest) => {
    return generateCoachingMutation.mutateAsync(request);
  }, [generateCoachingMutation]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['personalization', 'context'] });
  }, [queryClient]);

  return {
    context,
    loading,
    error: error instanceof ApiError ? error.message : null,
    generateCoaching,
    refresh,
  };
}
