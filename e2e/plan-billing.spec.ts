import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { setAuthCookies } from './helpers';

/**
 * E2E test for the Plan & billing subpage on /me.
 *
 * The /me page shows the current subscription status card only — the plan
 * picker lives on /pricing. Verifies:
 *   - Free user: sees "Free" status + "Upgrade to Pro" / "Compare plans"
 *     buttons that lead to /pricing.
 *   - Pro user: sees "Pro" status, billing interval, renewal date, and the
 *     "Manage billing" button (customer portal) — no upgrade CTA.
 *
 * Prerequisites:
 *   - Frontend running (bun run dev) on :3000
 *   - Backend stack running (make dev-all) + docker infra (make docker-up)
 *   - Seeded user: semiaactive.test@example.com / password
 */

const USER_ID = '01a02962-62b9-7d1d-bca9-ba7a90313b9f';
const PRO_PLAN_ID = '019f69e9-86ba-7c9a-a278-13efbc918d8d';
const PG = 'PGPASSWORD=growthmind123 psql -h localhost -p 5434 -U growthmind -d growthmind -t -A -c';

/** Flip the seeded user's subscription to free (the default state). */
function setFreePlan() {
  execSync(
    `${PG} "UPDATE subscriptions SET plan_id='${PRO_PLAN_ID}', status='free', billing_interval=null, current_period_start=null, current_period_end=null WHERE user_id='${USER_ID}'; UPDATE subscriptions SET plan_id=(SELECT id FROM plans WHERE code='free') WHERE user_id='${USER_ID}';"`,
    { encoding: 'utf8' },
  );
}

/** Flip the seeded user's subscription to active Pro (annual). */
function setProPlan() {
  execSync(
    `${PG} "UPDATE subscriptions SET plan_id='${PRO_PLAN_ID}', status='active', billing_interval='annual', current_period_start=now(), current_period_end=now() + interval '1 year' WHERE user_id='${USER_ID}';"`,
    { encoding: 'utf8' },
  );
}

test.afterEach(() => {
  // Restore the seeded user to free so we don't leave test state behind.
  setFreePlan();
});

test('Plan & billing: Free user sees status card with upgrade CTA', async ({ page }) => {
  setFreePlan();
  await setAuthCookies(page, { userId: USER_ID, username: 'semiaactive_test' });
  await page.goto('/me');

  await page.getByRole('button', { name: 'Plan & billing' }).click();
  await expect(page.getByRole('heading', { name: 'Plan & billing' })).toBeVisible();

  // Status card shows the Free plan.
  await expect(page.getByRole('heading', { name: 'Free', level: 3 })).toBeVisible();

  // Upgrade + compare CTAs are present; no per-card buttons remain.
  await expect(page.getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compare plans' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Manage billing' })).toHaveCount(0);
});

test('Plan & billing: Pro user sees subscription details and Manage billing', async ({ page }) => {
  setProPlan();
  await setAuthCookies(page, { userId: USER_ID, username: 'semiaactive_test' });
  await page.goto('/me');

  await page.getByRole('button', { name: 'Plan & billing' }).click();
  await expect(page.getByRole('heading', { name: 'Plan & billing' })).toBeVisible();

  // Status card shows Pro + interval + renewal date.
  await expect(page.getByRole('heading', { name: 'Pro', level: 3 })).toBeVisible();
  await expect(page.getByText('Annual')).toBeVisible();
  await expect(page.getByText('Renews')).toBeVisible();

  // Pro users manage via the portal — no upgrade CTA.
  await expect(page.getByRole('button', { name: 'Manage billing' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upgrade to Pro' })).toHaveCount(0);
});
