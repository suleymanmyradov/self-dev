import { useState, useCallback, useMemo } from 'react';
import type { ReportType } from '@/api';

const categoryMap: Record<string, ReportType> = {
  Bug: 'bug',
  'Abuse / Spam': 'abuse',
  'Content issue': 'abuse',
  Feedback: 'feedback',
  Other: 'feedback',
};

const categories = ['Bug', 'Abuse / Spam', 'Content issue', 'Feedback', 'Other'] as const;
export type ReportCategory = typeof categories[number];

type ReportStatus = 'idle' | 'submitting' | 'submitted';

export function useReportForm() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Bug');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<ReportStatus>('idle');

  const isSubmitting = status === 'submitting';
  const submitted = status === 'submitted';

  const canSubmit = useMemo(() => subject.trim().length > 2 && details.trim().length > 10, [subject, details]);

  const reset = useCallback(() => {
    setEmail('');
    setCategory('Bug');
    setSubject('');
    setDetails('');
    setStatus('idle');
  }, []);

  const toPayload = useCallback(() => ({
    type: categoryMap[category],
    title: subject.trim(),
    description: details.trim(),
    email: email.trim() || undefined,
  }), [category, subject, details, email]);

  return {
    email,
    setEmail,
    category,
    setCategory,
    subject,
    setSubject,
    details,
    setDetails,
    status,
    setStatus,
    submitted,
    isSubmitting,
    canSubmit,
    reset,
    toPayload,
    categories,
  };
}
