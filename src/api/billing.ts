import api from './axios-client';
import {
  BillingOverviewResponseSchema,
  UpgradeEventRequestSchema,
  UpgradeEventResponseSchema,
  PortalSessionResponseSchema,
  CreatePaddleCheckoutRequestSchema,
  PaddleCheckoutResponseSchema,
} from '@/lib/validation';
import type {
  BillingOverviewResponse,
  UpgradeEventRequest,
  UpgradeEventResponse,
  PortalSessionResponse,
  CreatePaddleCheckoutRequest,
  CreatePaddleCheckoutResponse,
} from './types';

const ENDPOINTS = {
  OVERVIEW: '/billing/overview',
  UPGRADE_EVENTS: '/billing/upgrade-events',
  PORTAL: '/billing/portal',
  PADDLE_CHECKOUT: '/billing/paddle-checkout',
};

export async function getBillingOverview(): Promise<BillingOverviewResponse> {
  const response = await api.get<unknown>(ENDPOINTS.OVERVIEW);
  return BillingOverviewResponseSchema.parse(response);
}

export async function trackUpgradeEvent(data: UpgradeEventRequest): Promise<UpgradeEventResponse> {
  const validated = UpgradeEventRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.UPGRADE_EVENTS, validated);
  return UpgradeEventResponseSchema.parse(response);
}

export async function createCustomerPortalSession(): Promise<PortalSessionResponse> {
  const response = await api.post<unknown>(ENDPOINTS.PORTAL, {});
  return PortalSessionResponseSchema.parse(response);
}

// Creates a Paddle transaction server-side bound to the authenticated user
// (paddle_checkouts) — checkout then opens with transactionId so the webhook
// never has to trust client-side custom_data for user binding.
export async function createPaddleCheckout(
  data: CreatePaddleCheckoutRequest,
): Promise<CreatePaddleCheckoutResponse> {
  const validated = CreatePaddleCheckoutRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.PADDLE_CHECKOUT, validated);
  return PaddleCheckoutResponseSchema.parse(response);
}
