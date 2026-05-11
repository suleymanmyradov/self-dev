import api from './client';
import type { CheckIn, CreateCheckInRequest, PageParams, ApiResponse } from './types';

const ENDPOINTS = {
  CHECK_INS: '/check-ins',
  TODAY: '/check-ins/today',
  HISTORY: '/check-ins/history',
};

export async function createCheckIn(data: CreateCheckInRequest): Promise<ApiResponse<{ checkIn: CheckIn; habit: any }>> {
  return api.post(ENDPOINTS.CHECK_INS, data);
}

export async function getTodayCheckIns(): Promise<ApiResponse<CheckIn[]>> {
  return api.get(ENDPOINTS.TODAY);
}

export async function getCheckInHistory(params: { habitId?: string } & PageParams): Promise<ApiResponse<CheckIn[]>> {
  return api.get(ENDPOINTS.HISTORY, params);
}
