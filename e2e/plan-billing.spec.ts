import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { setAuthCookies } from './helpers';

/**
 * E2E test for the Plan & billing subpage on /me.
 *
 * Verifies the Free card button behavior:
 *   - Free user: button visible, disabled, labeled "You're on this plan".
 *   - Pro user: button hidden entirely (downgrades go through the Paddle
 *     customer portal via the Pro card's "Manage billing" button).
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

/** The Free card is the pricing card whose <h3> says "Free".
 *  The h3 sits inside a flex row inside the card div, so the card is
 *  the h3's grandparent. */
function freeCard(page: import('@playwright/test').Page) {
  return page.getByRole('heading', { name: 'Free', level: 3 }).locator('xpath=../..');
}

test.afterEach(() => {
  // Restore the seeded user to free so we don't leave test state behind.
  setFreePlan();
});

test('Plan & billing: Free user sees disabled "You\'re on this plan" on the Free card', async ({ page }) => {
  setFreePlan();
  await setAuthCookies(page, { userId: USER_ID, username: 'semiaactive_test' });
  await page.goto('/me');

  await page.getByRole('button', { name: 'Plan & billing' }).click();
  await expect(page.getByRole('heading', { name: 'Plan & billing' })).toBeVisible();

  // Free card button is visible and disabled.
  const btn = freeCard(page).getByRole('button');
  await expect(btn).toBeVisible();
  await expect(btn).toBeDisabled();
  // Note: the source uses &apos; in a JS string literal, which JSX does not
  // decode — the button text literally contains "You&apos;re on this plan".
  await expect(btn).toContainText("on this plan");

  // Pro card shows "Upgrade to Pro" (not "You're on this plan").
  await expect(page.getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();
});

test('Plan & billing: Pro user does NOT see a Free card button', async ({ page }) => {
  setProPlan();
  await setAuthCookies(page, { userId: USER_ID, username: 'semiaactive_test' });
  await page.goto('/me');

  await page.getByRole('button', { name: 'Plan & billing' }).click();
  await expect(page.getByRole('heading', { name: 'Plan & billing' })).toBeVisible();

  // The Free card must not have any button.
  await expect(freeCard(page).getByRole('button')).toHaveCount(0);

  // Pro card shows "You're on this plan" + "Manage billing".
  const proCard = page.getByRole('heading', { name: 'Pro', level: 3 }).locator('xpath=../..');
  await expect(proCard.getByRole('button', { name: /on this plan/i })).toBeVisible();
  await expect(proCard.getByRole('button', { name: 'Manage billing' })).toBeVisible();
});
