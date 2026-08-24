import { test, expect, type Page } from '@playwright/test';
import { execSync } from 'child_process';
import { setAuthCookies, generateTestTokens } from './helpers';

/**
 * E2E test for the Notifications subpage on /me.
 *
 * Drives the real UI against the real backend and verifies each toggle
 * persists to notification_preferences. The In-app row is a disabled,
 * always-on switch (no backend field) — we assert it stays checked and
 * is not clickable.
 *
 * Prerequisites:
 *   - Frontend running (bun run dev) on :3000
 *   - Backend stack running (make dev-all) + docker infra (make docker-up)
 *   - Seeded user: semiaactive.test@example.com / password
 *
 * Backend defaults (Get with no row): email=true, push=true. So both
 * toggles start ON for a fresh user.
 */

const USER_ID = '01a02962-62b9-7d1d-bca9-ba7a90313b9f';
const PG = 'PGPASSWORD=growthmind123 psql -h localhost -p 5434 -U growthmind -d growthmind -t -A -c';

function getPref(col: 'email_notifications' | 'push_notifications'): boolean {
  const out = execSync(`${PG} "SELECT ${col} FROM notification_preferences WHERE user_id='${USER_ID}';"`, {
    encoding: 'utf8',
  }).trim();
  return out === 't';
}

/** Reset notification_preferences so the test starts from backend defaults.
 *  No in-memory cache on this table (Get returns defaults on no row), so a
 *  raw SQL delete is safe. Also reset user_preferences via the API to keep
 *  the seeded user clean for any future run. */
async function resetState() {
  execSync(`${PG} "DELETE FROM notification_preferences WHERE user_id='${USER_ID}';"`, {
    encoding: 'utf8',
  });
  const { accessToken } = await generateTestTokens({ userId: USER_ID, username: 'semiaactive_test' });
  await fetch('http://localhost:8888/api/v1/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timezone: 'UTC' }),
  });
}

/** Switch next to a row title. Same markup shape as the Reminders subpage. */
function switchFor(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('xpath=../..').getByRole('switch');
}

test.beforeEach(async () => {
  await resetState();
});

test('Notifications subpage: in-app locked on; email + push toggles persist', async ({ page }) => {
  await setAuthCookies(page, { userId: USER_ID, username: 'semiaactive_test' });
  await page.goto('/me');

  await page.getByRole('button', { name: 'Notifications' }).click();
  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();

  // ── In-app notifications: always on, disabled, not clickable ──────────
  const inAppSwitch = switchFor(page, 'In-app notifications');
  await expect(inAppSwitch).toBeDisabled();
  await expect(inAppSwitch).toHaveAttribute('aria-checked', 'true');
  // Clicking must not change state or create a prefs row.
  await inAppSwitch.click({ force: true }).catch(() => {});
  await expect(inAppSwitch).toHaveAttribute('aria-checked', 'true');

  // ── Email notifications: default ON → toggle OFF → ON ─────────────────
  const emailSwitch = switchFor(page, 'Email notifications');
  await expect(emailSwitch).toHaveAttribute('aria-checked', 'true');
  await emailSwitch.click();
  await expect(page.getByText('Notification preferences updated')).toBeVisible({ timeout: 10_000 });
  await expect.poll(() => getPref('email_notifications'), { timeout: 10_000 }).toBe(false);
  await expect(emailSwitch).toHaveAttribute('aria-checked', 'false');

  await emailSwitch.click();
  await expect.poll(() => getPref('email_notifications'), { timeout: 10_000 }).toBe(true);
  await expect(emailSwitch).toHaveAttribute('aria-checked', 'true');

  // ── Mobile push: default ON → toggle OFF → ON ─────────────────────────
  const pushSwitch = switchFor(page, 'Mobile push');
  await expect(pushSwitch).toHaveAttribute('aria-checked', 'true');
  await pushSwitch.click();
  await expect.poll(() => getPref('push_notifications'), { timeout: 10_000 }).toBe(false);
  await expect(pushSwitch).toHaveAttribute('aria-checked', 'false');

  await pushSwitch.click();
  await expect.poll(() => getPref('push_notifications'), { timeout: 10_000 }).toBe(true);
  await expect(pushSwitch).toHaveAttribute('aria-checked', 'true');

  // ── Toggle both OFF together; verify the full-object upsert didn't
  //    clobber the other fields (each PUT sends all six prefs). ─────────
  await emailSwitch.click();
  await expect.poll(() => getPref('email_notifications'), { timeout: 10_000 }).toBe(false);
  await pushSwitch.click();
  await expect.poll(() => getPref('push_notifications'), { timeout: 10_000 }).toBe(false);
  // email should still be false after the push toggle fired its own PUT.
  await expect.poll(() => getPref('email_notifications'), { timeout: 10_000 }).toBe(false);
});
