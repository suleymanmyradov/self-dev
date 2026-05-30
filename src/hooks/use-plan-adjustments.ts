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

  const createSuggestion = async (data: CreatePlanAdjustmentSuggestionRequest) => {
    return createSuggestionMutation.mutateAsync(data);
  };

  const updateStatus = async (
    suggestionId: string,
    data: UpdatePlanAdjustmentSuggestionStatusRequest
  ) => {
    return updateStatusMutation.mutateAsync({ suggestionId, data });
  };

  const acceptSuggestion = async (suggestionId: string) => {
    return updateStatus(suggestionId, { status: 'accepted' });
  };

  const dismissSuggestion = async (suggestionId: string) => {
    return updateStatus(suggestionId, { status: 'dismissed' });
  };

  const applySuggestion = async (suggestionId: string) => {
    return applySuggestionMutation.mutateAsync(suggestionId);
  };

  return {
    suggestions,
    loading,
    error: error instanceof ApiError ? error.message : null,
    total: suggestions.length,
    createSuggestion,
    updateStatus,
    acceptSuggestion,
    dismissSuggestion,
    applySuggestion,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['plan-adjustments'] }),
  };
}
