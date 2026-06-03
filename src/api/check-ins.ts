import api from './axios-client';
import {
  CreateCheckInRequestSchema,
  CreateCheckInResponseDataSchema,
  CheckInsResponseSchema,
} from '@/lib/validation';
import type { CheckIn, CreateCheckInRequest, CreateCheckInResponseData, PageParams, ApiResponse } from './types';

const ENDPOINTS = {
  CHECK_INS: '/check-ins',
  TODAY: '/check-ins/today',
  HISTORY: '/check-ins/history',
};

export async function createCheckIn(data: CreateCheckInRequest): Promise<ApiResponse<CreateCheckInResponseData>> {
  const validated = CreateCheckInRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.CHECK_INS, validated);
  const parsed = CreateCheckInResponseDataSchema.parse(response);
  return { data: parsed };
}

export async function getTodayCheckIns(): Promise<ApiResponse<CheckIn[]>> {
  const response = await api.get<unknown>(ENDPOINTS.TODAY);
  return CheckInsResponseSchema.parse(response);
}

export async function getCheckInHistory(params: { habitId?: string } & PageParams): Promise<ApiResponse<CheckIn[]>> {
  const response = await api.get<unknown>(ENDPOINTS.HISTORY, params);
  return CheckInsResponseSchema.parse(response);
}
