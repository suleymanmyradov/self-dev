'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { isProd } from '@/lib/config';
import { reportError } from '@/instrumentation';

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Label used in the dev-mode console log, e.g. "Goals". */
  logLabel: string;
  /** Heading shown to the user, e.g. "Failed to load goals". */
  title: string;
  /** Message shown in production (and as a fallback in dev). */
  message: string;
  /** Show a "Go home" link next to the retry button. */
  showHomeLink?: boolean;
}

/**
 * Shared error fallback for route-level `error.tsx` boundaries.
 *
 * Each route's `error.tsx` is a thin wrapper that passes route-specific
 * copy. Keeping the UI here means a fix to error UX only needs to happen
 * once instead of across 19 copy-pasted files.
 */
export function RouteError({
  error,
  reset,
  logLabel,
  title,
  message,
  showHomeLink = false,
}: RouteErrorProps) {
  useEffect(() => {
    if (isProd) {
      reportError(error, { digest: error.digest, label: logLabel });
    } else {
      reportError(error, { label: logLabel });
    }
  }, [error, logLabel]);

  const displayMessage = isProd ? message : error.message || message;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        {displayMessage}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        {showHomeLink && (
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go home
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
