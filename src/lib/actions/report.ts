'use server';

import { serverPost } from '@/lib/server-api';
import { ReportRequestSchema } from '@/lib/validation';
import type { ReportRequest } from '@/api/types';

export interface ReportActionState {
  success: boolean;
  error?: string;
}

export async function submitReportAction(
  _prevState: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  try {
    const raw: ReportRequest = {
      type: (formData.get('type') as string) as ReportRequest['type'],
      title: (formData.get('title') as string) || '',
      description: (formData.get('description') as string) || '',
      email: (formData.get('email') as string) || undefined,
    };

    const validated = ReportRequestSchema.safeParse(raw);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(', '),
      };
    }

    await serverPost('/report', validated.data);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit report';
    return { success: false, error: message };
  }
}
