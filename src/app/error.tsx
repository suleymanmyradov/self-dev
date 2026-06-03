'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { isProd } from '@/lib/config';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isProd) {
      // In production, send to error tracking service (e.g., Sentry)
      // console.error is suppressed in production to avoid leaking internals
      console.error('Error digest:', error.digest);
    } else {
      console.error('Error:', error);
    }
  }, [error]);

  // Sanitize error message in production to prevent information leakage
  const displayMessage = isProd
    ? 'An unexpected error occurred. Please try again.'
    : (error.message || 'An unexpected error occurred. Please try again.');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Something went wrong!</h2>
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        {displayMessage}
      </p>
      {!isProd && error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          Digest: {error.digest}
        </p>
      )}
      <Button onClick={reset} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
