import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBillingOverview,
  trackUpgradeEvent,
  createCheckoutSession,
  createCustomerPortalSession,
} from '@/api/billing';
import type { UpgradeEventRequest, BillingOverviewResponse } from '@/api';

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
  const { data, ...rest } = useBillingOverview();
  return {
    data: data?.entitlements,
    ...rest,
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
