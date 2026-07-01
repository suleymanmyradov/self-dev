'use client';

import { useActionState, startTransition, useState } from 'react';
import Link from 'next/link';
import { GalleryVerticalEnd } from 'lucide-react';
import { forgotPasswordAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Self Dev AI
        </Link>
        <div className="rounded-xl border bg-card p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Forgot password</h1>
              <p className="text-balance text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>
            <div className="grid gap-6">
              {state.error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              {state.success && (
                <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                  {state.message}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
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
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
