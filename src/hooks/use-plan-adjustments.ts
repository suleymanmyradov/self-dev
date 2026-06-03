import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingPlanAdjustmentSuggestions,
  createPlanAdjustmentSuggestion,
  updatePlanAdjustmentSuggestionStatus,
  applyPlanAdjustmentSuggestion,
} from '../api';
import type {
  CreatePlanAdjustmentSuggestionRequest,
  UpdatePlanAdjustmentSuggestionStatusRequest,
} from '../api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

export function usePlanAdjustments(autoLoad = true) {
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading: loading, error } = useQuery({
    queryKey: ['plan-adjustments'],
    queryFn: () => getPendingPlanAdjustmentSuggestions(),
    enabled: autoLoad,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createSuggestionMutation = useMutation({
    mutationFn: (data: CreatePlanAdjustmentSuggestionRequest) => createPlanAdjustmentSuggestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-adjustments'] });
      toast.success('Suggestion created successfully');
    },
    onError: handleMutationError,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ suggestionId, data }: { suggestionId: string; data: UpdatePlanAdjustmentSuggestionStatusRequest }) =>
      updatePlanAdjustmentSuggestionStatus(suggestionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-adjustments'] });
      toast.success('Suggestion status updated');
    },
    onError: handleMutationError,
  });

  const applySuggestionMutation = useMutation({
    mutationFn: (suggestionId: string) => applyPlanAdjustmentSuggestion({ id: suggestionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-adjustments'] });
      toast.success('Suggestion applied successfully');
    },
    onError: handleMutationError,
  });

  const createSuggestion = useCallback(async (data: CreatePlanAdjustmentSuggestionRequest) => {
    return createSuggestionMutation.mutateAsync(data);
  }, [createSuggestionMutation]);

  const updateStatus = useCallback(async (
    suggestionId: string,
    data: UpdatePlanAdjustmentSuggestionStatusRequest
  ) => {
    return updateStatusMutation.mutateAsync({ suggestionId, data });
  }, [updateStatusMutation]);

  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    return updateStatus(suggestionId, { status: 'accepted' });
  }, [updateStatus]);

  const dismissSuggestion = useCallback(async (suggestionId: string) => {
    return updateStatus(suggestionId, { status: 'dismissed' });
  }, [updateStatus]);

  const applySuggestion = useCallback(async (suggestionId: string) => {
    return applySuggestionMutation.mutateAsync(suggestionId);
  }, [applySuggestionMutation]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['plan-adjustments'] });
  }, [queryClient]);

  return useMemo(() => ({
    suggestions,
    loading,
    error: error instanceof ApiError ? error.message : null,
    total: suggestions.length,
    createSuggestion,
    updateStatus,
    acceptSuggestion,
    dismissSuggestion,
    applySuggestion,
    refresh,
  }), [suggestions, loading, error, createSuggestion, updateStatus, acceptSuggestion, dismissSuggestion, applySuggestion, refresh]);
}
