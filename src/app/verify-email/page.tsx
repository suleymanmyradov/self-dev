'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GalleryVerticalEnd, Loader2, CheckCircle2, XCircle, MailWarning } from 'lucide-react';
import { verifyEmailAction, resendVerificationAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const setAuth = useAuthStore((s) => s.login);

  // Initialize from the token so we don't setState synchronously in the effect.
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() =>
    token ? 'loading' : 'error',
  );
  const [error, setError] = useState<string | null>(() =>
    token ? null : 'No verification token was provided in the link.',
  );
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      const result = await verifyEmailAction(token);
      if (cancelled) return;
      if (result.success && result.user) {
        setAuth(result.user);
        setStatus('success');
        toast.success('Email verified! Welcome to Growth.');
        setTimeout(() => router.push('/habits'), 1500);
      } else {
        setStatus('error');
        setError(result.error ?? 'Verification failed.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router, setAuth]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    const result = await resendVerificationAction(resendEmail);
    setResending(false);
    if (result.success) {
      toast.success(result.message ?? 'Verification email sent.');
    } else {
      toast.error(result.error ?? 'Failed to resend.');
    }
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
          <div className="flex flex-col items-center gap-4 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="size-8 animate-spin text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Verifying your email…</h1>
                <p className="text-sm text-muted-foreground">Please wait while we confirm your email address.</p>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="size-8 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Email verified!</h1>
                <p className="text-sm text-muted-foreground">Redirecting you to your dashboard…</p>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="size-8 text-destructive" />
                <h1 className="text-xl font-bold tracking-tight">Verification failed</h1>
                <p className="text-sm text-muted-foreground">{error}</p>
                <div className="mt-2 w-full rounded-md bg-muted/40 p-4 text-left">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <MailWarning className="size-4" /> Resend verification link
                  </div>
                  <form onSubmit={handleResend} className="grid gap-2">
                    <Label htmlFor="resendEmail" className="sr-only">
                      Email
                    </Label>
                    <Input
                      id="resendEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={resending}
                      required
                    />
                    <Button type="submit" disabled={resending} variant="secondary" className="w-full">
                      {resending ? 'Sending…' : 'Resend verification email'}
                    </Button>
                  </form>
                </div>
                <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary">
                  Back to login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
