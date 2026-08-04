import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for the Growth frontend.
 *
 * These tests require the full stack to be running:
 *   - Frontend: bun run dev (or next start)
 *   - Backend: make dev-all (gateway + auth + client + etc.)
 *   - Docker: make docker-up (Postgres, Redis, etc.)
 *
 * Run: bunx playwright test
 * Run with UI: bunx playwright test --ui
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Auth tests share a DB — run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid DB conflicts
  reporter: 'html',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Ignore HTTPS errors for local dev
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Don't start the web server automatically — the developer should have
  // the full stack running. This avoids port conflicts and lets us test
  // against the real backend.
  // webServer: {
  //   command: 'bun run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: true,
  // },
});
