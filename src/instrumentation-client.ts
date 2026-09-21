import * as Sentry from '@sentry/nextjs';

// Client-side error capture. NEXT_PUBLIC_SENTRY_DSN is inlined at build
// time (CI build arg); when it's absent init is skipped and the Sentry
// calls in reportError()/error boundaries no-op.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'production',
    tracesSampleRate: 0.05,
    sendDefaultPii: false,
    // Session replay intentionally off — habit/journal content is private.
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
