'use client';

import { useActionState, startTransition, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GalleryVerticalEnd } from 'lucide-react';
import { resetPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, dispatch, isPending] = useActionState(resetPasswordAction, {
    success: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set('token', token);
    startTransition(() => {
      dispatch(formData);
    });
  };

  if (state.success) {
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
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-xl font-bold tracking-tight">Password reset</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Button className="w-full" onClick={() => router.push('/login')}>
                Continue to login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
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
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-xl font-bold tracking-tight">Invalid link</h1>
              <p className="text-sm text-muted-foreground">
                This reset link is missing a token. Please use the link from your reset email.
              </p>
              <Link href="/forgot-password" className="text-sm underline underline-offset-4 hover:text-primary">
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
              <p className="text-balance text-sm text-muted-foreground">
                Choose a strong password for your account.
              </p>
            </div>
            <div className="grid gap-6">
              {state.error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}
              <input type="hidden" name="token" value={token} />
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
                {state.fieldErrors?.newPassword && (
                  <p className="text-xs text-destructive">{state.fieldErrors.newPassword[0]}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Resetting…' : 'Reset password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
