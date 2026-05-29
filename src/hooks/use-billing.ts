import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBillingOverview,
  trackUpgradeEvent,
  createCheckoutSession,
  createCustomerPortalSession,
} from '@/api/billing';
import type { UpgradeEventRequest } from '@/api';

export function useBillingOverview() {
  return useQuery({
    queryKey: ['billing', 'overview'],
    queryFn: () => getBillingOverview(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
