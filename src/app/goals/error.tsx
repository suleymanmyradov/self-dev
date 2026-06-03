'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { isProd } from '@/lib/config';

export default function GoalsError({
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
      console.error('Goals error:', error);
    }
  }, [error]);

  const displayMessage = isProd
    ? 'Could not load your goals. Please try again.'
    : (error.message || 'Could not load your goals. Please try again.');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Failed to load goals</h2>
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        {displayMessage}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
