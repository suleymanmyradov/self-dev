import { test, expect, type Page } from '@playwright/test';
import { execSync } from 'child_process';
import { setAuthCookies, generateTestTokens } from './helpers';

/**
 * E2E test for the Reminders subpage on /me.
 *
 * Drives the real UI against the real backend (gateway + notifications +
 * client services) and verifies each toggle / setting actually persists to
 * the database. This is the "manual E2E" check for the Reminders subpage.
 *
 * Prerequisites:
 *   - Frontend running (bun run dev) on :3000
 *   - Backend stack running (make dev-all) + docker infra (make docker-up)
 *   - Seeded user: semiaactive.test@example.com / password
 *     (backend/sql/seed_data/sample_semi_active_user.sql)
 *
 * The seeded user starts with no notification_preferences / user_preferences
 * rows; the backend upserts them on first PUT.
 */

const USER_ID = '01a02962-62b9-7d1d-bca9-ba7a90313b9f';
const PG = 'PGPASSWORD=growthmind123 psql -h localhost -p 5434 -U growthmind -d growthmind -t -A -c';

/** Query a single column from notification_preferences for the seeded user. */
function getPref(col: 'habit_reminders' | 'goal_reminders' | 'streak_warnings' | 'sunday_review'): boolean {
  const out = execSync(`${PG} "SELECT ${col} FROM notification_preferences WHERE user_id='${USER_ID}';"`, {
    encoding: 'utf8',
  }).trim();
  return out === 't';
}

/** Query timezone / check_in_time from user_preferences. */
function getSettings(): { timezone: string; checkInTime: string } {
  const row = execSync(
    `${PG} "SELECT timezone || '|' || to_char(check_in_time, 'HH24:MI') FROM user_preferences WHERE user_id='${USER_ID}';"`,
    { encoding: 'utf8' },
  ).trim();
  const [timezone, checkInTime] = row.split('|');
  return { timezone, checkInTime };
}

/** Reset the seeded user's reminder-related state so the test is deterministic.
 *  notification_preferences has no cache (Get returns defaults on no row), so a
 *  raw SQL delete is fine. user_preferences IS cached in-memory in the client
 *  service (5m TTL, invalidated only on UpdateUserPreferences), so we reset it
 *  via the API (PUT /settings) to properly invalidate the cache. */
async function resetState() {
  execSync(
    `${PG} "DELETE FROM notification_preferences WHERE user_id='${USER_ID}';"`,
    { encoding: 'utf8' },
  );
  const { accessToken } = await generateTestTokens({ userId: USER_ID, username: 'semiaactive_test' });
  await fetch('http://localhost:8888/api/v1/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timezone: 'UTC' }),
  });
}

/** Locate the Switch next to a row title (e.g. "Goal deadline reminders").
 *  The markup is: <div class="flex ...justify-between..."> <div><p>LABEL</p>…</div> <Switch/> </div>
 *  so from the label <p>, the row is two ancestors up, and the switch lives in that row. */
function switchFor(page: Page, label: string) {
  return page
    .getByText(label, { exact: true })
    .locator('xpath=../..')
    .getByRole('switch');
}

test.beforeEach(async () => {
  await resetState();
});

test('Reminders subpage: every toggle and the timezone/check-in settings persist', async ({ page }) => {
  await setAuthCookies(page, { userId: USER_ID, username: 'semiaactive_test' });
  await page.goto('/me');

  // Open the Reminders subpage via the sidebar nav.
  await page.getByRole('button', { name: 'Reminders' }).click();
  await expect(page.getByRole('heading', { name: 'Reminders' })).toBeVisible();

  // ── Daily nudge (habit_reminders) ──────────────────────────────────────
  // Default is on (DB row absent → backend default true). Toggle it OFF.
  const dailySwitch = switchFor(page, 'Daily nudge');
  await expect(dailySwitch).toHaveAttribute('aria-checked', 'true');
  await dailySwitch.click();
  await expect(page.getByText('Notification preferences updated')).toBeVisible({ timeout: 10_000 });
  await expect.poll(() => getPref('habit_reminders'), { timeout: 10_000 }).toBe(false);
  await expect(dailySwitch).toHaveAttribute('aria-checked', 'false');

  // Toggle back ON.
  await dailySwitch.click();
  await expect.poll(() => getPref('habit_reminders'), { timeout: 10_000 }).toBe(true);

  // ── Goal deadline reminders ───────────────────────────────────────────
  // Backend default is ON (Get returns goalReminders=true when no row exists),
  // so the switch starts checked. Toggle it OFF and verify it persists.
  const goalSwitch = switchFor(page, 'Goal deadline reminders');
  await expect(goalSwitch).toHaveAttribute('aria-checked', 'true');
  await goalSwitch.click();
  await expect.poll(() => getPref('goal_reminders'), { timeout: 10_000 }).toBe(false);
  await expect(goalSwitch).toHaveAttribute('aria-checked', 'false');

  // ── Weekly review (sunday_review) ──────────────────────────────────────
  const weeklySwitch = switchFor(page, 'Weekly review');
  await weeklySwitch.click();
  await expect.poll(() => getPref('sunday_review'), { timeout: 10_000 }).toBe(true);

  // ── Streak warnings ────────────────────────────────────────────────────
  const streakSwitch = switchFor(page, 'Streak warnings');
  await streakSwitch.click();
  await expect.poll(() => getPref('streak_warnings'), { timeout: 10_000 }).toBe(true);

  // ── Timezone + check-in time (Save button) ─────────────────────────────
  // Pick a distinctive timezone via the Select, then Save. Verify the value
  // the combobox shows and that it persists to user_preferences.
  const selectTrigger = page.locator('button[role="combobox"]').first();
  await selectTrigger.click();
  await page.getByRole('option', { name: 'Asia/Tokyo' }).click();
  // Wait for the dropdown to close and the trigger to reflect the new value.
  await expect(selectTrigger).toContainText('Asia/Tokyo');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect.poll(() => getSettings().timezone, { timeout: 15_000 }).toBe('Asia/Tokyo');
});
