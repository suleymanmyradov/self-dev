'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AICoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('AI Coach error:', error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Chat error</h2>
      </div>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'Something went wrong with the AI chat. Please try again.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Link href="/ai-coach">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            New chat
          </Button>
        </Link>
      </div>
    </div>
  );
}
