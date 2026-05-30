import api from './axios-client';
import { ReportRequestSchema } from '@/lib/validation';
import type { ReportRequest } from './types';

const ENDPOINTS = {
  REPORT: '/report',
};

/**
 * Submit a report/feedback
 */
export async function submitReport(data: ReportRequest): Promise<void> {
  const validated = ReportRequestSchema.parse(data);
  await api.post(ENDPOINTS.REPORT, validated);
}
