'use client';

import { useActionState, startTransition, useState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { capitalizeFirst } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [state, dispatch, isPending] = useActionState(forgotPasswordAction, {
    success: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  };

  return (
    <div className="flex min-h-svh">
      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-card p-6 md:p-10">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl">Forgot password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <div className="grid gap-5">
              {state.error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {capitalizeFirst(state.error)}
                </div>
              )}
              {state.success && (
                <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
                  {state.message}
                </div>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  required
                />
                {state.fieldErrors?.email && (
                  <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Sending…' : 'Send reset link'}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link href="/login" className="text-success hover:underline underline-offset-4">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Quote panel */}
      <div className="hidden md:flex w-[230px] shrink-0 border-l border-border bg-background flex-col justify-center p-8">
        <div className="space-y-6">
          <p className="font-display text-lg leading-relaxed">
            &ldquo;Every morning is a fresh start.&rdquo;
          </p>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            From the library
          </p>
        </div>
      </div>
    </div>
  );
}
