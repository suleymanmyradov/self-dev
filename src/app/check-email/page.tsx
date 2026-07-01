'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GalleryVerticalEnd, MailCheck } from 'lucide-react';
import { resendVerificationAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    const result = await resendVerificationAction(email);
    setSending(false);
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
            <MailCheck className="size-10 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-balance text-sm text-muted-foreground">
              We sent a verification link to your email. Click it to activate your account.
              The link expires in 1 hour.
            </p>
          </div>
          <div className="mt-6 rounded-md bg-muted/40 p-4">
            <p className="mb-2 text-sm font-medium">Didn&apos;t get the email?</p>
            <form onSubmit={handleResend} className="grid gap-2">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
                required
              />
              <Button type="submit" disabled={sending} variant="secondary" className="w-full">
                {sending ? 'Sending…' : 'Resend verification email'}
              </Button>
            </form>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
