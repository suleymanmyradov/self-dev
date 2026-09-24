import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * E2E test for the Paddle pricing page (/pricing) against the Paddle sandbox.
 *
 * Covers: localized price rendering, the auth gate on Subscribe, and the full
 * checkout loop — overlay opens, test card completes, /welcome redirect, and
 * the webhook flips the subscription to pro.
 *
 * Prerequisites:
 *   - Frontend running (bun run dev) on :3000 with NEXT_PUBLIC_PADDLE_* set
 *   - Backend stack running: gateway :8888, client RPC :9082, Postgres, Redis
 *   - cloudflared tunnel + Paddle sandbox notification destination pointing at
 *     it (webhook delivery is asserted via the DB)
 *   - Sandbox dashboard: default payment link set (Checkout settings)
 *   - Test account paddle-e2e@test.dev / TestPass123! (register once via the
 *     API, then set email_verified=true and add a user_profiles row)
 *
 * Auth note: tokens are minted by the real login endpoint — e2e/helpers'
 * generateTestTokens doesn't match the backend signing keys here.
 */

const USER_EMAIL = 'paddle-e2e@test.dev';
const USER_PASSWORD = 'TestPass123!';
const USER_ID = '01a0ccc3-6ebb-75d5-8b3f-169143dd9170';
const API = 'http://localhost:8888/api/v1';
const PG =
  'PGPASSWORD=growthmind123 psql -h localhost -p 5434 -U growthmind -d growthmind -t -A -c';

/** Log in via the real gateway and set the session cookies Playwright needs. */
async function login(page: import('@playwright/test').Page) {
  const res = await page.request.post(`${API}/auth/login`, {
    data: { email: USER_EMAIL, password: USER_PASSWORD },
  });
  const { accessToken, refreshToken } = await res.json();
  await page.context().addCookies([
    { name: 'auth-token', value: accessToken, domain: 'localhost', path: '/' },
    { name: 'refresh-token', value: refreshToken, domain: 'localhost', path: '/' },
  ]);
}

function getPlan(): string {
  return execSync(
    `${PG} "SELECT p.code || '/' || s.status FROM subscriptions s JOIN plans p ON p.id=s.plan_id WHERE s.user_id='${USER_ID}';"`,
    { encoding: 'utf8' },
  ).trim();
}

function setFreePlan() {
  execSync(
    `${PG} "UPDATE subscriptions SET plan_id=(SELECT id FROM plans WHERE code='free'), status='free', billing_interval=null, paddle_subscription_id=null, cancel_at_period_end=false WHERE user_id='${USER_ID}';"`,
    { encoding: 'utf8' },
  );
}

/** Dismiss the cookie-consent banner so it can't intercept clicks. */
async function dismissCookieBanner(page: import('@playwright/test').Page) {
  const region = page.getByRole('region', { name: /cookie consent/i });
  // The banner hydrates in asynchronously — give it a moment, then accept.
  if (await region.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false)) {
    await region.getByRole('button', { name: 'Accept all' }).click();
  }
}

test.afterEach(() => {
  setFreePlan();
});

test.describe('Paddle pricing page', () => {
  test('renders Free and Pro tiers with localized prices', async ({ page }) => {
    await login(page);
    await page.goto('/pricing');
    await dismissCookieBanner(page);

    await expect(
      page.getByRole('heading', { name: 'Free', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Pro', level: 2 }),
    ).toBeVisible();

    // Free shows a static $0; Pro shows the Paddle localized total.
    await expect(page.getByText('$0')).toBeVisible();
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();

    // Yearly toggle swaps to the annual price.
    await page.getByRole('button', { name: 'Yearly' }).click();
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  });

  test('anonymous users are sent to login instead of checkout', async ({
    page,
  }) => {
    await page.goto('/pricing');
    await dismissCookieBanner(page);
    await page.getByRole('button', { name: 'Subscribe' }).click();
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test('checkout completes end-to-end and upgrades to pro', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    setFreePlan();
    await login(page);
    // Register before goto — /profile/me fires during page hydration.
    const profileRes = page.waitForResponse(/profile\/me/);
    await page.goto('/pricing');
    await profileRes;
    await dismissCookieBanner(page);
    const subscribe = page.getByRole('button', { name: 'Subscribe' });
    await expect(subscribe).toBeEnabled({ timeout: 15_000 });
    await subscribe.click();

    // Paddle overlay is a cross-origin iframe.
    const frame = page.frameLocator('iframe[name^="paddle_frame"]').first();
    const cardInput = frame.getByLabel(/card number/i);
    await expect(cardInput).toBeVisible({ timeout: 30_000 });
    await frame.getByLabel(/name on card|card ?holder/i).fill('Paddle E2E');
    await cardInput.fill('4242424242424242');
    await frame.getByLabel(/expiry/i).fill('1230');
    await frame.getByLabel(/cvc|cvv|security code/i).fill('100');

    // Paddle can still be provisioning the transaction checkout when the
    // form finishes filling — "TransactionCheckout has draft status" is a
    // known sandbox race. Retry the submit until the payment goes through.
    const payButton = frame.getByRole('button', {
      name: /pay|subscribe|complete/i,
    });
    const draftError = frame.getByText(/draft status/i);
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.waitForTimeout(2000);
      await payButton.click();
      // Give the failure banner a moment; if it doesn't appear we're through.
      const failed = await draftError
        .waitFor({ state: 'visible', timeout: 4000 })
        .then(() => true)
        .catch(() => false);
      if (!failed || (await page.url().includes('/welcome'))) break;
    }

    await expect(page).toHaveURL(/\/welcome/, { timeout: 60_000 });

    // The webhook delivers asynchronously — poll until the sub flips.
    await expect
      .poll(() => getPlan(), { timeout: 30_000, intervals: [1000, 2000, 3000] })
      .toBe('pro/active');
  });
});
