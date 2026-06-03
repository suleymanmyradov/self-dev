import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBillingOverview,
  trackUpgradeEvent,
  createCheckoutSession,
  createCustomerPortalSession,
} from '@/api/billing';
import type { UpgradeEventRequest, BillingOverviewResponse } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

export function useBillingOverview(initialData?: BillingOverviewResponse) {
  return useQuery({
    queryKey: ['billing', 'overview'],
    queryFn: () => getBillingOverview(),
    select: (data) => data.data,
    initialData,
    staleTime: 15 * 60 * 1000, // 15 minutes — billing rarely changes
  });
}

export function useEntitlements() {
  const { data, isLoading, isError, error, isPending, isFetching, status, fetchStatus } = useBillingOverview();
  return {
    data: data?.entitlements,
    isLoading,
    isError,
    error,
    isPending,
    isFetching,
    status,
    fetchStatus,
  };
}

export function useTrackUpgradeEvent() {
  return useMutation({
    mutationFn: (data: UpgradeEventRequest) => trackUpgradeEvent(data),
    onError: handleMutationError,
  });
}

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: handleMutationError,
  });
}

export function useCreateCustomerPortalSession() {
  return useMutation({
    mutationFn: createCustomerPortalSession,
    onError: handleMutationError,
  });
}
