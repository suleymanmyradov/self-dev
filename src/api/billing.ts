import api from './axios-client';
import {
  BillingOverviewResponseSchema,
  UpgradeEventRequestSchema,
  UpgradeEventResponseSchema,
  PortalSessionResponseSchema,
} from '@/lib/validation';
import type {
  BillingOverviewResponse,
  UpgradeEventRequest,
  UpgradeEventResponse,
  PortalSessionResponse,
} from './types';

const ENDPOINTS = {
  OVERVIEW: '/billing/overview',
  UPGRADE_EVENTS: '/billing/upgrade-events',
  PORTAL: '/billing/portal',
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
