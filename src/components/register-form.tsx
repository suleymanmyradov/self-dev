
'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerAction } from '@/lib/actions/auth';
import { useAuthStore } from '@/store/auth';
import { useRegisterForm } from '@/hooks';
import { GoogleButton } from '@/components/google-button';
import Link from 'next/link';
import { toast } from 'sonner';
import { capitalizeFirst } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const setAuthUser = useAuthStore((s) => s.login);
  const {
    fullName, setFullName,
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, setError,
    fieldErrors, setFieldErrors,
    reset,
    validate,
  } = useRegisterForm();

  const [state, dispatch, isPending] = useActionState(registerAction, {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  });

  useEffect(() => {
    if (state.success && state.requiresVerification) {
      toast.success('Account created. Check your email to verify your account.');
      reset();
      router.push('/check-email');
    } else if (state.success && state.user) {
      setAuthUser(state.user);
      toast.success('Account created successfully');
      reset();
      router.push('/onboarding');
    } else if (state.error) {
      setError(state.error);
    } else if (state.fieldErrors) {
      setFieldErrors(state.fieldErrors);
    }
  }, [state, setAuthUser, reset, setError, setFieldErrors, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    setFieldErrors({});

    const validated = validate();
    if (!validated) {
      e.preventDefault();
    }
  };

  return (
    <form action={dispatch} onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl">Start with one habit.</h1>
        <p className="text-sm text-muted-foreground">
          Setup takes about two minutes.
        </p>
      </div>

      <div className="grid gap-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {capitalizeFirst(error)}
          </div>
        )}

        {/* Name */}
        <div className="grid gap-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium">Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isPending}
            aria-invalid={!!fieldErrors.fullName}
            aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
          />
          {fieldErrors.fullName && (
            <p id="fullName-error" className="text-xs text-destructive">
              {fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="grid gap-1.5">
          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            disabled={isPending}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={!!fieldErrors.username}
            aria-describedby={fieldErrors.username ? 'username-error' : undefined}
          />
          {fieldErrors.username && (
            <p id="username-error" className="text-xs text-destructive">
              {fieldErrors.username[0]}
            </p>
          )}
        </div>

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
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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

        {/* Confirm Password */}
        <div className="grid gap-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            className="font-mono"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>

        {/* Terms text */}
        <p className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our Terms and Privacy Policy.
        </p>

        {/* OR divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-mono tracking-wider">OR</span>
          </div>
        </div>

        <GoogleButton label="Continue with Google" />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-success hover:underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}
