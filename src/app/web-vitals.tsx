'use client';

import { useReportWebVitals } from 'next/web-vitals';

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

/**
 * Handle a single Core Web Vitals metric.
 *
 * In development the metric is logged to the console for visibility. In
 * production this is a no-op for now — wire it up to an analytics endpoint
 * later by replacing the production branch with a `fetch`/`sendBeacon` call.
 */
const handleWebVitals: ReportWebVitalsCallback = (metric) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[web-vitals] ${metric.name}:`, metric);
    return;
  }

  // TODO: send to analytics endpoint once configured.
  // Example:
  //   const body = JSON.stringify(metric);
  //   if (navigator.sendBeacon) {
  //     navigator.sendBeacon('/analytics/web-vitals', body);
  //   } else {
  //     fetch('/analytics/web-vitals', { body, method: 'POST', keepalive: true });
  //   }
};

/**
 * Client component that reports Core Web Vitals.
 *
 * Rendered once in the root layout. Returns `null` so it adds no DOM.
 */
export function WebVitals() {
  useReportWebVitals(handleWebVitals);
  return null;
}
