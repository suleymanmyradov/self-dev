'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/lib/actions/auth';
import { useAuthStore } from '@/store/auth';
import { useLoginForm } from '@/hooks';
import { GoogleButton } from '@/components/google-button';
import Link from 'next/link';
import { toast } from 'sonner';
import { capitalizeFirst } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.login);
  const {
    email, setEmail,
    password, setPassword,
    error, setError,
    fieldErrors, setFieldErrors,
    reset,
    validate,
  } = useLoginForm();

  const [state, dispatch, isPending] = useActionState(loginAction, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  useEffect(() => {
    if (state.success && state.user) {
      setAuth(state.user);
      toast.success('Logged in successfully');
      reset();
      router.push('/plan');
    } else if (state.error) {
      setError(state.error);
    } else if (state.fieldErrors) {
      setFieldErrors(state.fieldErrors);
    }
  }, [state, setAuth, reset, setError, setFieldErrors, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    setFieldErrors({});

    // Prevent the server-action submission only when client-side validation
    // fails. When validation passes, let the form's action={dispatch} handle
    // the submission so the server action fires even before hydration (progressive
    // enhancement) — without action={dispatch}, a pre-hydration submit falls
    // back to a native GET that puts credentials in the URL and never logs in.
    const validated = validate();
    if (!validated) {
      e.preventDefault();
    }
  };

  return (
    <form action={dispatch} onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl">Welcome back.</h1>
        <p className="text-sm text-muted-foreground">
          Six habits are waiting for you.
        </p>
      </div>

      <div className="grid gap-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {capitalizeFirst(error)}
          </div>
        )}

        {/* Email */}
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
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-success hover:underline underline-offset-4"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="font-mono"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          />
          {fieldErrors.password && (
            <p id="password-error" className="text-xs text-destructive">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>

        {/* OR divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-mono tracking-wider">OR</span>
          </div>
        </div>

        <GoogleButton />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="text-success hover:underline underline-offset-4">
          Create an account
        </Link>
      </div>
    </form>
  );
}
