import type { Page, Route } from '@playwright/test';

export const COACH_USER_ID = '00000000-0000-4000-8000-000000000001';
export const COACH_CONVERSATION_ID = '00000000-0000-4000-8000-000000000002';

export function coachConversation(overrides: Record<string, unknown> = {}) {
  return {
    id: COACH_CONVERSATION_ID,
    title: 'Synthetic coaching thread',
    type: 'coach',
    lastMessage: 'A persisted synthetic answer.',
    userId: COACH_USER_ID,
    archived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:01:00Z',
    ...overrides,
  };
}

export function coachMessage(
  role: 'user' | 'assistant',
  content: string,
  id = `${role}-message-1`,
) {
  return {
    id,
    content,
    role,
    conversationId: COACH_CONVERSATION_ID,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

export function sse(event: string, payload: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export function controlledSSE(
  events: string[],
  options: { delayMs?: number } = {},
): ReadableStream<Uint8Array> {
  const delayMs = options.delayMs ?? 0;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const event of events) {
        if (delayMs > 0) await new Promise(resolve => setTimeout(resolve, delayMs));
        controller.enqueue(new TextEncoder().encode(event));
      }
      controller.close();
    },
  });
}

export async function installCoachApiRoutes(
  page: Page,
  options: {
    conversations?: unknown[];
    messages?: unknown[];
    billingPlan?: 'free' | 'pro';
  } = {},
): Promise<void> {
  const conversations = options.conversations ?? [];
  const messages = options.messages ?? [];
  await page.route('**/api/v1/**', async (route: Route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    if (path === '/conversations' && route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          data: conversations,
          page: { total: conversations.length, page: 1, limit: 50, totalPages: 1 },
        }),
      });
      return;
    }
    if (path === `/conversations/${COACH_CONVERSATION_ID}/messages`) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          data: messages,
          page: { total: messages.length, page: 1, limit: 50, totalPages: 1 },
        }),
      });
      return;
    }
    if (path === '/billing/overview') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          plans: [],
          subscription: {
            id: 'subscription-1',
            userId: COACH_USER_ID,
            planId: `plan-${options.billingPlan ?? 'free'}`,
            planCode: options.billingPlan ?? 'free',
            planName: options.billingPlan === 'pro' ? 'Pro' : 'Free',
            status: 'active',
            cancelAtPeriodEnd: false,
          },
          entitlements: {
            planCode: options.billingPlan ?? 'free',
            status: 'active',
            personalizedAiEnabled: true,
            canCreateGoal: true,
            canCreateHabit: true,
            canViewWeeklyReviewHistory: true,
            canUsePersonalizedAi: true,
            canCreatePlanAdjustment: true,
            currentActiveGoals: 0,
            currentActiveHabits: 0,
            currentPendingAdjustments: 0,
          },
          billingMode: 'disabled',
        }),
      });
      return;
    }
    await route.continue();
  });
}
