import { test, expect, type Page, type Route } from '@playwright/test';
import { setAuthCookies } from './helpers';

/**
 * E2E tests for the onboarding wizard flow.
 *
 * These tests cover the full 7-step onboarding wizard in a real browser:
 *   - Step 1: goal title + category selection (DB categories)
 *   - Step 2: motivation input
 *   - Step 3: blocker selection
 *   - Step 4: daily time commitment (minutes)
 *   - Step 5: accountability style (gentle/balanced/strict)
 *   - Step 6: check-in time selection
 *   - Step 7: AI habit suggestions with toggle selection
 *   - Generate habits (/personalization/onboarding-habits)
 *   - Loading state during AI habit generation
 *   - Skip setup option
 *   - Back / Next navigation with validation
 *   - Completion redirects to app
 *
 * Strategy:
 *   - Auth cookies are set via setAuthCookies (real JWT, same secret as proxy).
 *   - Backend API responses are mocked via page.route() so the wizard renders
 *     and completes without needing a real DB user. This tests the full UI
 *     flow (Next.js rendering + client store + navigation) in a real browser.
 *
 * Prerequisites:
 *   - Frontend running (bun run dev or next start)
 *   - The proxy validates the JWT from .env.local (JWT_SECRET)
 */

// ============================================
// Mock API response helpers
// ============================================

/** Mock GET /settings → 404 (no settings yet, allows onboarding to proceed). */
async function mockSettingsNotFound(route: Route) {
  await route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'not found' }),
  });
}

/** Mock POST /personalization/onboarding-habits → 3 habit suggestions. */
async function mockOnboardingHabits(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: [
        { name: 'Study for 20 minutes', description: 'Focus on one topic.' },
        { name: 'Review your notes', description: 'Spend 5 min reviewing.' },
        { name: 'Plan tomorrow', description: 'Write 3 tasks for tomorrow.' },
      ],
    }),
  });
}

/** Mock POST /goals → created goal. */
async function mockCreateGoal(route: Route) {
  await route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        id: 'goal_e2e_1',
        title: 'E2E Goal',
        description: '',
        category: 'education',
        progress: 0,
        completed: false,
        active: true,
        userId: 'usr_e2e_1',
        relatedHabitIds: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  });
}

/** Mock POST /habits → created habit. */
async function mockCreateHabit(route: Route) {
  await route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        id: 'habit_e2e_1',
        name: 'E2E Habit',
        description: '',
        category: 'education',
        streak: 0,
        completed: false,
        userId: 'usr_e2e_1',
        recentHistory: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  });
}

/** Mock PUT /settings → updated settings with onboardingCompleted. */
async function mockUpdateSettings(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        id: 'set_e2e_1',
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        accountabilityStyle: 'balanced',
        checkInTime: '09:00',
        onboardingCompleted: true,
        userId: 'usr_e2e_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  });
}

/** Mock GET /categories → DB categories for the goal step. */
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

/**
 * Install all onboarding-related API mocks on the page.
 * Pass `withHabits: false` to skip the habit-generation mock (for the
 * loading-state test that intercepts it separately).
 */
async function mockOnboardingApis(page: Page, opts: { withHabits?: boolean } = {}) {
  const { withHabits = true } = opts;
  await page.route('**/api/v1/settings', async (route) => {
    if (route.request().method() === 'GET') return mockSettingsNotFound(route);
    if (route.request().method() === 'PUT') return mockUpdateSettings(route);
    return route.continue();
  });
  await page.route('**/api/v1/categories**', mockCategories);
  await page.route('**/api/v1/goals', async (route) => {
    if (route.request().method() === 'POST') return mockCreateGoal(route);
    return route.continue();
  });
  await page.route('**/api/v1/habits', async (route) => {
    if (route.request().method() === 'POST') return mockCreateHabit(route);
    return route.continue();
  });
  if (withHabits) {
    await page.route('**/api/v1/personalization/onboarding-habits', mockOnboardingHabits);
  }
}

// ============================================
// Tests
// ============================================

// ============================================
// Route protection
// ============================================

test('onboarding route protection: unauthenticated user is redirected to login', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/onboarding');
  await page.waitForURL('**/login?redirect=*', { timeout: 5000 });
  const url = new URL(page.url());
  expect(url.searchParams.get('redirect')).toBe('/onboarding');
});

test('onboarding route protection: authenticated user can access /onboarding', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');
  // Should stay on /onboarding (not redirected to /login)
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('/onboarding');
});

// ============================================
// Step 1 — Goal title + category selection
// ============================================

test('step 1: renders goal title input and DB category buttons', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await expect(page.getByText('What are you hoping changes?')).toBeVisible();
  await expect(page.getByPlaceholder(/Study consistently/i)).toBeVisible();
  // DB categories render
  await expect(page.getByText('Education')).toBeVisible();
  await expect(page.getByText('Health')).toBeVisible();
  await expect(page.getByText('Career')).toBeVisible();
});

test('step 1: Continue is disabled until goal title has >= 3 chars', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  const continueBtn = page.getByRole('button', { name: /continue/i });
  await expect(continueBtn).toBeDisabled();

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await expect(continueBtn).toBeEnabled();
});

test('step 1: selecting a category highlights it', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByText('Education').click();
  // The selected category button should have the foreground background class
  const eduBtn = page.getByText('Education');
  await expect(eduBtn).toHaveClass(/bg-foreground/);
});

// ============================================
// Step 2 — Motivation input
// ============================================

test('step 2: Continue is disabled until motivation has >= 3 chars', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  // Fill step 1 and advance
  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByText('Education').click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 2: motivation
  await expect(page.getByText('Why does this matter to you?')).toBeVisible();
  const continueBtn = page.getByRole('button', { name: /continue/i });
  await expect(continueBtn).toBeDisabled();

  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await expect(continueBtn).toBeEnabled();
});

// ============================================
// Step 3 — Blocker selection
// ============================================

test('step 3: renders blocker options and Continue is always enabled', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 3: blocker
  await expect(page.getByText('What usually stops you?')).toBeVisible();
  await expect(page.getByText('Lack of time')).toBeVisible();
  await expect(page.getByText('Low motivation')).toBeVisible();
  await expect(page.getByText('Too distracted')).toBeVisible();
  await expect(page.getByText('Unclear plan')).toBeVisible();
  // Continue is always enabled (blocker is optional)
  await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled();
});

// ============================================
// Step 4 — Daily time commitment
// ============================================

test('step 4: renders minute options and Continue is always enabled', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // step 3 → 4

  await expect(page.getByText('How much time, honestly?')).toBeVisible();
  await expect(page.getByText('15 min')).toBeVisible();
  await expect(page.getByText('30 min')).toBeVisible();
  await expect(page.getByText('1 hour')).toBeVisible();
  await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled();
});

// ============================================
// Step 5 — Accountability style
// ============================================

test('step 5: renders accountability styles and Continue is always enabled', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // 3 → 4
  await page.getByRole('button', { name: /continue/i }).click(); // 4 → 5

  await expect(page.getByText('How should I hold you accountable?')).toBeVisible();
  await expect(page.getByText('Gentle')).toBeVisible();
  await expect(page.getByText('Balanced')).toBeVisible();
  await expect(page.getByText('Strict')).toBeVisible();
  await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled();
});

// ============================================
// Step 6 — Check-in time selection
// ============================================

test('step 6: renders check-in time buttons and Continue is always enabled', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // 3 → 4
  await page.getByRole('button', { name: /continue/i }).click(); // 4 → 5
  await page.getByRole('button', { name: /continue/i }).click(); // 5 → 6

  await expect(page.getByText('When should I check in with you?')).toBeVisible();
  await expect(page.getByText('06:00')).toBeVisible();
  await expect(page.getByText('09:00')).toBeVisible();
  await expect(page.getByText('21:00')).toBeVisible();
  await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled();
});

// ============================================
// Step 7 — AI habit suggestions + generate habits
// ============================================

test('step 6 → 7: Continue triggers habit generation and shows suggestions', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // 3 → 4
  await page.getByRole('button', { name: /continue/i }).click(); // 4 → 5
  await page.getByRole('button', { name: /continue/i }).click(); // 5 → 6

  // Click Continue on step 6 — this calls generateHabits and advances to 7
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 7: habit suggestions should appear
  await expect(page.getByText(/smallest version that works/i)).toBeVisible();
  await expect(page.getByText('Study for 20 minutes')).toBeVisible();
  await expect(page.getByText('Review your notes')).toBeVisible();
  await expect(page.getByText('Plan tomorrow')).toBeVisible();
});

test('step 7: habit suggestions are all selected by default', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // 3 → 4
  await page.getByRole('button', { name: /continue/i }).click(); // 4 → 5
  await page.getByRole('button', { name: /continue/i }).click(); // 5 → 6
  await page.getByRole('button', { name: /continue/i }).click(); // 6 → 7 (generates)

  await expect(page.getByText('Study for 20 minutes')).toBeVisible();
  // The finish button should be enabled (at least one habit selected)
  await expect(page.getByRole('button', { name: /start tomorrow morning/i })).toBeEnabled();
});

test('step 7: toggling a habit off and back on', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // 3 → 4
  await page.getByRole('button', { name: /continue/i }).click(); // 4 → 5
  await page.getByRole('button', { name: /continue/i }).click(); // 5 → 6
  await page.getByRole('button', { name: /continue/i }).click(); // 6 → 7

  const firstHabit = page.getByRole('button', { name: 'Study for 20 minutes' });
  await firstHabit.click();
  // After toggling off, the habit card should look dimmed (opacity-60)
  await expect(firstHabit).toHaveClass(/opacity-60/);
  // Toggle back on
  await firstHabit.click();
  await expect(firstHabit).not.toHaveClass(/opacity-60/);
});

// ============================================
// Loading state during AI habit generation
// ============================================

test('loading state: shows "Building plan..." while habits are being generated', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page, { withHabits: false });

  // Intercept the habit generation call and delay it so we can observe loading
  let resolveHabits!: () => void;
  await page.route('**/api/v1/personalization/onboarding-habits', async (route) => {
    await new Promise<void>((resolve) => {
      resolveHabits = resolve;
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { name: 'Habit A', description: 'desc' },
          { name: 'Habit B', description: 'desc' },
          { name: 'Habit C', description: 'desc' },
        ],
      }),
    });
  });

  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // 3 → 4
  await page.getByRole('button', { name: /continue/i }).click(); // 4 → 5
  await page.getByRole('button', { name: /continue/i }).click(); // 5 → 6

  // Click Continue on step 6 — triggers habit generation.
  // The Continue button shows "Building plan..." while generating (step 7
  // doesn't render until generation completes, since handleNext awaits it).
  await page.getByRole('button', { name: /continue/i }).click();

  // The Continue button should show the loading state
  await expect(page.getByText('Building plan...')).toBeVisible({ timeout: 5000 });

  // Release the delayed response
  resolveHabits();
  // After loading completes, step 7 renders with habits
  await expect(page.getByText('Habit A')).toBeVisible({ timeout: 5000 });
});

// ============================================
// Skip setup option
// ============================================

test('skip setup: resets and navigates to /plan', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  // Type something in step 1
  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');

  // Click "Skip setup"
  await page.getByText('Skip setup').click();

  // Should navigate to /plan
  await page.waitForURL('**/plan', { timeout: 5000 });
  expect(page.url()).toContain('/plan');
});

// ============================================
// Back / Next navigation
// ============================================

test('back navigation: Back button returns to the previous step', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  // Step 1 → 2
  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByText('Why does this matter to you?')).toBeVisible();

  // Back → 1
  await page.getByRole('button', { name: /back/i }).click();
  await expect(page.getByText('What are you hoping changes?')).toBeVisible();

  // Skip setup should reappear on step 1 (Back is hidden)
  await expect(page.getByText('Skip setup')).toBeVisible();
  await expect(page.getByRole('button', { name: /back/i })).not.toBeVisible();
});

test('progress indicator: shows "Step X of 7"', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  await expect(page.getByText(/step 1 of 7/i)).toBeVisible();

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByText(/step 2 of 7/i)).toBeVisible();
});

// ============================================
// Completion redirects to app
// ============================================

test('completion: finishing onboarding creates goal+habits+settings and redirects to /plan', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page);
  await page.goto('/onboarding');

  // Step 1: goal + category
  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByText('Education').click();
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 2: motivation
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 3: blocker (optional, just continue)
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 4: commitment (default 30, just continue)
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 5: accountability (default balanced, just continue)
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 6: check-in time (default 09:00, continue → generates habits)
  await page.getByRole('button', { name: /continue/i }).click();

  // Step 7: wait for habit suggestions, then finish
  await expect(page.getByText('Study for 20 minutes')).toBeVisible();
  await page.getByRole('button', { name: /start tomorrow morning/i }).click();

  // Should navigate to /plan after completion
  await page.waitForURL('**/plan', { timeout: 10000 });
  expect(page.url()).toContain('/plan');
});

// ============================================
// Error fallback during habit generation
// ============================================

test('error fallback: shows fallback habits when AI generation fails', async ({ page }) => {
  await setAuthCookies(page);
  await mockOnboardingApis(page, { withHabits: false });

  // Mock the habit generation endpoint to return a 500
  await page.route('**/api/v1/personalization/onboarding-habits', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'AI service unavailable' }),
    });
  });

  await page.goto('/onboarding');

  await page.getByPlaceholder(/Study consistently/i).fill('Read more books');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder(/feel confident/i).fill('To grow every day');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // 3 → 4
  await page.getByRole('button', { name: /continue/i }).click(); // 4 → 5
  await page.getByRole('button', { name: /continue/i }).click(); // 5 → 6
  await page.getByRole('button', { name: /continue/i }).click(); // 6 → 7

  // Fallback habits should appear (first one references the goal title).
  // Use exact text for the first habit to avoid matching the goal title in
  // the summary card at the bottom of step 7.
  await expect(page.getByText('Work on Read more books for 10 minutes')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Review your plan for tomorrow')).toBeVisible();
  await expect(page.getByText('Track your progress')).toBeVisible();
});
