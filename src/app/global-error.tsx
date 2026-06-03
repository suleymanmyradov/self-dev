'use client';

import { useEffect } from 'react';
import NextError from 'next/error';
import { Button } from '@/components/ui/button';
import { isProd } from '@/lib/config';

export default function GlobalError({
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
      console.error('Global error digest:', error.digest);
    } else {
      console.error('Global error:', error);
    }
  }, [error]);

  const displayMessage = isProd
    ? 'An unexpected error occurred. Please try again.'
    : (error.message || 'An unexpected error occurred. Please try again.');

  return (
    <html>
      <body className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <h2 className="text-xl font-semibold">Something went wrong!</h2>
          <p className="text-muted-foreground max-w-md">{displayMessage}</p>
          {!isProd && error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Digest: {error.digest}
            </p>
          )}
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
          <NextError statusCode={500} title={displayMessage} />
        </div>
      </body>
    </html>
  );
}
