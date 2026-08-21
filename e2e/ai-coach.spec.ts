import { expect, test } from '@playwright/test';

import { setAuthCookies } from './helpers';
import {
  COACH_CONVERSATION_ID,
  COACH_USER_ID,
  coachConversation,
  coachMessage,
  installCoachApiRoutes,
  sse,
} from './ai-coach-fixtures';

test.describe('AI Coach deterministic journeys', () => {
  test('protects new and resumed coach routes without authentication', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/coach');
    await expect(page).toHaveURL(/\/login/);
    await page.goto(`/coach/${COACH_CONVERSATION_ID}`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('renders the empty coach state for an authenticated free user', async ({ page }) => {
    await setAuthCookies(page, { userId: COACH_USER_ID, username: 'synthetic-coach' });
    await installCoachApiRoutes(page, { billingPlan: 'free' });

    await page.goto('/coach');
    await expect(page.getByText('Build habits that feel sustainable.')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Message input' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Plan my Thursday' })).toBeVisible();
    if (test.info().project.name === 'chromium-mobile-coach') {
      await page.getByRole('button', { name: 'Open conversations' }).click();
      await expect(page.getByRole('dialog').getByText('Deeper coaching memory')).toBeVisible();
    } else {
      await expect(page.getByText('Deeper coaching memory')).toBeVisible();
    }
  });

  test('creates a conversation, streams ordered states, and updates the URL', async ({ page }) => {
    await setAuthCookies(page, { userId: COACH_USER_ID, username: 'synthetic-coach' });
    await installCoachApiRoutes(page, { billingPlan: 'pro' });
    await page.route('**/api/v1/conversations', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: coachConversation() }),
      });
    });
    await page.route('**/api/v1/personalization/coaching-stream', async route => {
      const request = route.request().postDataJSON() as { userMessage: string };
      const firstTurn = request.userMessage === 'Help me begin';
      await route.fulfill({
        contentType: 'text/event-stream',
        body: firstTurn
          ? sse('thinking', { message: 'Reviewing your goals...' }) +
            sse('reasoning', { text: 'Checking context.' }) +
            sse('proposal', {
              id: 'proposal-1',
              action: 'create_goal',
              payload: { title: 'Take one step', description: '', category: 'growth' },
            }) +
            sse('delta', { text: 'Choose one small action.' }) +
            sse('complete', { fullResponse: 'Choose one small action.' })
          : sse('delta', { text: 'Then keep that action small.' }) +
            sse('complete', { fullResponse: 'Then keep that action small.' }),
      });
    });

    await page.goto('/coach');
    const input = page.getByRole('textbox', { name: 'Message input' });
    await input.fill('Help me begin');
    await input.press('Enter');

    await expect(page.getByText('Help me begin')).toBeVisible();
    await expect(page.getByText('Choose one small action.')).toBeVisible();
    await expect(page.getByText('Title: Take one step')).toBeVisible();
    await expect(page.getByText('Checking context.')).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/coach/${COACH_CONVERSATION_ID}$`));

    await input.fill('What next?');
    await input.press('Enter');

    await expect(page.getByText('Then keep that action small.')).toBeVisible();
    await expect(page.getByText('Choose one small action.')).toBeVisible();
    await expect(page.getByText('Title: Take one step')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
  });

  test('loads persisted messages for an existing conversation', async ({ page }) => {
    await setAuthCookies(page, { userId: COACH_USER_ID, username: 'synthetic-coach' });
    await installCoachApiRoutes(page, {
      billingPlan: 'pro',
      conversations: [coachConversation()],
      messages: [
        coachMessage('user', 'Earlier question', 'user-1'),
        coachMessage('assistant', 'Earlier answer', 'assistant-1'),
      ],
    });

    await page.goto(`/coach/${COACH_CONVERSATION_ID}`);
    await expect(page.getByText('Earlier question')).toBeVisible();
    await expect(page.getByText('Earlier answer')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Message input' })).toBeVisible();
  });
});
