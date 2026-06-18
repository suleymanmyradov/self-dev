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
 * Currently a no-op stub: in development it logs to the console, in
 * production it is silent. Wire this up to Sentry (or similar) later by
 * replacing the body with `Sentry.captureException(error, { extra: context })`.
 *
 * Exported so client-side error boundaries can import and call it.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[reportError]', error, context ?? {});
    return;
  }

  // TODO: forward to Sentry / other provider once configured.
  // Example:
  //   Sentry.captureException(error, { extra: context });
}

/**
 * Called once on server startup. Use to initialise OTel, Sentry, etc.
 */
export function register(): void {
  // TODO: initialise observability provider here.
  // Example:
  //   registerOTel('growth-frontend');
  //   Sentry.init({ dsn: process.env.SENTRY_DSN });
}
