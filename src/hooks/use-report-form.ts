import { useState, useCallback } from 'react';
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

export function useReportForm() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Bug');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = subject.trim().length > 2 && details.trim().length > 10;

  const reset = useCallback(() => {
    setEmail('');
    setCategory('Bug');
    setSubject('');
    setDetails('');
    setSubmitted(false);
    setIsSubmitting(false);
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
    submitted,
    setSubmitted,
    isSubmitting,
    setIsSubmitting,
    canSubmit,
    reset,
    toPayload,
    categories,
  };
}
