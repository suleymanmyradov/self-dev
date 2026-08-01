import api from './axios-client';
import { z } from 'zod';
import {
  BillingOverviewResponseSchema,
  UpgradeEventRequestSchema,
  UpgradeEventResponseSchema,
  CheckoutSessionResponseSchema,
  PortalSessionResponseSchema,
} from '@/lib/validation';
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

const CreateCheckoutSessionRequestSchema = z.object({
  planCode: z.string().min(1, 'planCode is required'),
  billingInterval: z.enum(['monthly', 'annual']),
});

export async function getBillingOverview(): Promise<BillingOverviewResponse> {
  const response = await api.get<unknown>(ENDPOINTS.OVERVIEW);
  return BillingOverviewResponseSchema.parse(response);
}

export async function trackUpgradeEvent(data: UpgradeEventRequest): Promise<UpgradeEventResponse> {
  const validated = UpgradeEventRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.UPGRADE_EVENTS, validated);
  return UpgradeEventResponseSchema.parse(response);
}

export async function createCheckoutSession(data: {
  planCode: string;
  billingInterval: 'monthly' | 'annual';
}): Promise<CheckoutSessionResponse> {
  const validated = CreateCheckoutSessionRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.CHECKOUT, validated);
  return CheckoutSessionResponseSchema.parse(response);
}

export async function createCustomerPortalSession(): Promise<PortalSessionResponse> {
  const response = await api.post<unknown>(ENDPOINTS.PORTAL, {});
  return PortalSessionResponseSchema.parse(response);
}
