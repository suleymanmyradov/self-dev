import api from './client';
import type {
  BillingOverviewResponse,
  UpgradeEventRequest,
  UpgradeEventResponse,
  CheckoutSessionResponse,
  PortalSessionResponse,
} from './types';

const ENDPOINTS = {
  OVERVIEW: '/billing/overview',
  UPGRADE_EVENTS: '/billing/upgrade-events',
  CHECKOUT: '/billing/checkout',
  PORTAL: '/billing/portal',
};

export async function getBillingOverview(): Promise<BillingOverviewResponse> {
  return api.get(ENDPOINTS.OVERVIEW);
}

export async function trackUpgradeEvent(data: UpgradeEventRequest): Promise<UpgradeEventResponse> {
  return api.post(ENDPOINTS.UPGRADE_EVENTS, data);
}

export async function createCheckoutSession(data: {
  planCode: string;
  billingInterval: 'monthly' | 'annual';
}): Promise<CheckoutSessionResponse> {
  return api.post(ENDPOINTS.CHECKOUT, data);
}

export async function createCustomerPortalSession(): Promise<PortalSessionResponse> {
  return api.post(ENDPOINTS.PORTAL, {});
}
