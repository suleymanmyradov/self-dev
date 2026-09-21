import * as Sentry from '@sentry/nextjs';

/**
 * Server-side instrumentation hook.
 *
 * Next.js calls `register()` once when a new server instance starts, before
 * it begins handling requests. This is the right place to initialise
 * observability providers (Sentry, OpenTelemetry, etc.).
 *
 * See: .next-docs/01-app/03-api-reference/03-file-conventions/instrumentation.mdx
 */

/**
 * Report an error to the configured observability provider.
 *
 * In development it logs to the console; in production it forwards to
 * Sentry (a no-op until NEXT_PUBLIC_SENTRY_DSN/SENTRY_DSN is configured).
 *
 * Exported so client-side error boundaries can import and call it.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[reportError]', error, context ?? {});
    return;
  }

  Sentry.captureException(error, { extra: context });
}

/**
 * Called once on server startup. Initialises Sentry for server-side error
 * capture when SENTRY_DSN is set in the container env.
 */
export function register(): void {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT ?? 'production',
      // Distributed tracing goes to Tempo; keep a small slice for error context.
      tracesSampleRate: 0.05,
      sendDefaultPii: false,
    });
  }
}
