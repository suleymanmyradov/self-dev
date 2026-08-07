import { test, expect, type Page, type Route } from '@playwright/test';
import { setAuthCookies } from './helpers';

/**
 * E2E tests for the article "Add to Plan" flow.
 *
 * Coverage:
 *   - The plan page opens the "New habit" dialog pre-filled with the article's
 *     title/excerpt/category (passed via query params by the article page's
 *     "Add to Plan" link).
 *   - Submitting the dialog POSTs /habits with the pre-filled values and the
 *     dialog closes on success.
 *
 * Strategy:
 *   - Auth cookies are set via setAuthCookies (real JWT, same secret as proxy).
 *   - The article page is a Server Component that fetches the article SSR via
 *     the gateway, which page.route() cannot intercept. So we test the plan-side
 *     flow by navigating to the exact URL the article page's "Add to Plan" link
 *     produces (/plan?newHabitFromArticle=1&name=...&description=...&category=...).
 *   - The plan page's client-side API calls are mocked via page.route() so the
 *     flow is deterministic.
 *
 * Prerequisites:
 *   - Full stack running (frontend + backend + docker deps) — the plan page's
 *     SSR fetches (habits/goals) hit the real gateway and return empty for the
 *     test JWT's non-existent user, same convention as onboarding-flows.spec.ts.
 */

// ============================================
// Mock API response helpers
// ============================================

const ARTICLE_TITLE = 'How to build a reading habit';
const ARTICLE_EXCERPT = 'A practical guide to reading every day.';
const ARTICLE_CATEGORY_SLUG = 'education';

/** Mock GET /categories → DB categories for the habit form dropdown. */
async function mockCategories(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: [
        { id: '1', name: 'Education', slug: 'education', sortOrder: 1, createdAt: '', updatedAt: '' },
        { id: '2', name: 'Health', slug: 'health', sortOrder: 2, createdAt: '', updatedAt: '' },
        { id: '3', name: 'Career', slug: 'career', sortOrder: 3, createdAt: '', updatedAt: '' },
      ],
    }),
  });
}

/** Mock GET /profile/me → a fake user so the auth store flips to authenticated. */
async function mockProfileMe(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        id: 'usr_e2e_1',
        fullName: 'E2E Test User',
        username: 'e2e_user',
        email: 'e2e@test.dev',
        bio: '',
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
      },
    }),
  });
}

/** Mock GET /billing/overview → free plan with habit creation allowed. */
async function mockBillingOverview(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      plans: [],
      subscription: { planCode: 'free', status: 'active' },
      entitlements: {
        planCode: 'free',
        status: 'active',
        activeGoalLimit: 3,
        activeHabitLimit: 9,
        personalizedAiEnabled: false,
        canCreateGoal: true,
        canCreateHabit: true,
        canViewWeeklyReviewHistory: false,
        canUsePersonalizedAi: false,
        canCreatePlanAdjustment: false,
        currentActiveGoals: 0,
        currentActiveHabits: 0,
        currentPendingAdjustments: 0,
      },
      billingMode: 'fake_door',
    }),
  });
}

/** Mock GET /habits → empty list. */
async function mockListHabits(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: [],
      page: { total: 0, page: 1, limit: 100, totalPages: 0 },
    }),
  });
}

/** Mock GET /goals → empty list. */
async function mockListGoals(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: [],
      page: { total: 0, page: 1, limit: 100, totalPages: 0 },
    }),
  });
}

/**
 * Install plan-page API mocks on the page. Returns a list that captures
 * POST /habits request bodies so the test can assert what was sent.
 */
async function mockPlanApis(page: Page): Promise<string[]> {
  const createHabitBodies: string[] = [];

  await page.route('**/api/v1/profile/me', mockProfileMe);
  await page.route('**/api/v1/categories**', mockCategories);
  await page.route('**/api/v1/billing/overview', mockBillingOverview);
  await page.route('**/api/v1/habits', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postData() ?? '';
      createHabitBodies.push(body);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'habit_e2e_created',
            name: ARTICLE_TITLE,
            description: ARTICLE_EXCERPT,
            category: ARTICLE_CATEGORY_SLUG,
            streak: 0,
            completed: false,
            userId: 'usr_e2e_1',
            recentHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
      return;
    }
    return mockListHabits(route);
  });
  await page.route('**/api/v1/goals', async (route) => {
    if (route.request().method() === 'GET') return mockListGoals(route);
    return route.continue();
  });

  return createHabitBodies;
}

// ============================================
// Tests
// ============================================

test('add to plan: plan page opens habit dialog pre-filled from article query params', async ({ page }) => {
  await setAuthCookies(page);
  await mockPlanApis(page);

  // Navigate to the exact URL the article page's "Add to Plan" link produces.
  const url =
    `/plan?newHabitFromArticle=1` +
    `&name=${encodeURIComponent(ARTICLE_TITLE)}` +
    `&description=${encodeURIComponent(ARTICLE_EXCERPT)}` +
    `&category=${encodeURIComponent(ARTICLE_CATEGORY_SLUG)}`;
  await page.goto(url);

  // The "New habit" dialog should open automatically with the pre-filled values.
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('heading', { name: 'New habit' })).toBeVisible();

  // The Name field should be pre-filled with the article title.
  const nameInput = dialog.locator('input').first();
  await expect(nameInput).toHaveValue(ARTICLE_TITLE);

  // The Description textarea should be pre-filled with the article excerpt.
  const descriptionTextarea = dialog.locator('textarea').first();
  await expect(descriptionTextarea).toHaveValue(ARTICLE_EXCERPT);
});

test('add to plan: submitting the pre-filled dialog creates a habit with the article data', async ({ page }) => {
  await setAuthCookies(page);
  const createHabitBodies = await mockPlanApis(page);

  const url =
    `/plan?newHabitFromArticle=1` +
    `&name=${encodeURIComponent(ARTICLE_TITLE)}` +
    `&description=${encodeURIComponent(ARTICLE_EXCERPT)}` +
    `&category=${encodeURIComponent(ARTICLE_CATEGORY_SLUG)}`;
  await page.goto(url);

  // Wait for the pre-filled dialog to open.
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Submit the form.
  await dialog.getByRole('button', { name: 'Save' }).click();

  // The POST /habits should fire with the article's title/excerpt/category.
  await expect.poll(() => createHabitBodies.length, { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
  const sentBody = JSON.parse(createHabitBodies[0]);
  expect(sentBody.name).toBe(ARTICLE_TITLE);
  expect(sentBody.description).toBe(ARTICLE_EXCERPT);
  expect(sentBody.category).toBe(ARTICLE_CATEGORY_SLUG);

  // The dialog should close after a successful create.
  await expect(dialog).not.toBeVisible({ timeout: 10_000 });
});
