import api from './client';
import type {
  ReportRequest,
} from './types';

const ENDPOINTS = {
  REPORT: '/report',
};

/**
 * Submit a report/feedback
 */
export async function submitReport(data: ReportRequest): Promise<void> {
  return api.post(ENDPOINTS.REPORT, data);
}
