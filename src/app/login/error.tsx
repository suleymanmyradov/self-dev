'use client';

import { useEffect } from 'react';
import { isProd } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isProd) {
      console.error('Error digest:', error.digest);
    } else {
      console.error('Login error:', error);
    }
  }, [error]);

  const displayMessage = isProd
    ? 'Failed to load login page. Please try again.'
    : (error.message || 'Failed to load login page. Please try again.');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        {displayMessage}
      </p>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
