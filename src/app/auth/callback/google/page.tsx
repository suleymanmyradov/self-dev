'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GalleryVerticalEnd, Loader2, XCircle } from 'lucide-react';
import { googleLoginAction } from '@/lib/actions/auth';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { capitalizeFirst } from '@/lib/utils';

function GoogleCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get('code') ?? '';
  const state = params.get('state') ?? '';
  const setAuth = useAuthStore((s) => s.login);

  // Initialize from the code so we don't setState synchronously in the effect.
  const [error, setError] = useState<string | null>(() =>
    code ? null : 'Google did not return an authorization code.',
  );

  useEffect(() => {
    if (!code) return;

    // Optional state validation: if we stored a state value before redirecting,
    // verify it matches to prevent CSRF. For now we accept any non-empty state.
    void state;

    let cancelled = false;
    (async () => {
      const result = await googleLoginAction(code);
      if (cancelled) return;
      if (result.success && result.user) {
        setAuth(result.user);
        toast.success('Signed in with Google');
        // Route through /onboarding: it redirects to /habits when onboarding is
        // already complete, so returning users skip it while new users are guided
        // through the setup flow.
        router.push('/onboarding');
      } else {
        setError(result.error ?? 'Google sign-in failed.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, state, router, setAuth]);

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
            {error ? (
              <>
                <XCircle className="size-8 text-destructive" />
                <h1 className="text-xl font-bold tracking-tight">Google sign-in failed</h1>
                <p className="text-sm text-muted-foreground">{capitalizeFirst(error)}</p>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                >
                  Back to login
                </Link>
              </>
            ) : (
              <>
                <Loader2 className="size-8 animate-spin text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Finishing sign-in…</h1>
                <p className="text-sm text-muted-foreground">Completing your Google authentication.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
