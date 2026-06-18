'use client';

import { formatRelativeTime } from '@/lib/time-format';

interface RelativeTimeProps {
  date: string;
  className?: string;
}

/**
 * Client-side relative time formatter.
 *
 * Used in Server Components that are cached (use cache / cacheComponents),
 * where `new Date()` is not allowed. Rendering on the client also means the
 * relative time is accurate to the viewer's clock, not the server's.
 */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  return <span className={className}>{formatRelativeTime(date)}</span>;
}
