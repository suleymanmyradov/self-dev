import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBillingOverview,
  trackUpgradeEvent,
  createCheckoutSession,
  createCustomerPortalSession,
} from '@/api/billing';
import type { UpgradeEventRequest, BillingOverviewResponse } from '@/api';
import { useAuthStore } from '@/store/auth';

export function useBillingOverview(initialData?: BillingOverviewResponse) {
  const hasToken = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['billing', 'overview'],
    queryFn: () => getBillingOverview(),
    initialData,
    enabled: hasToken,
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
  });
}

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
  });
}

export function useCreateCustomerPortalSession() {
  return useMutation({
    mutationFn: createCustomerPortalSession,
  });
}
