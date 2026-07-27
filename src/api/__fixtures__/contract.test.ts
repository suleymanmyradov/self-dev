import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import {
  AuthResponseSchema,
  RegisterResponseSchema,
  ActivityResponseSchema,
  HabitsResponseSchema,
  HabitResponseSchema,
  GoalsResponseSchema,
  GoalResponseSchema,
  NotificationsResponseSchema,
  UnreadNotificationCountResponseSchema,
  BillingOverviewSchema,
  SearchResponseSchema,
} from '@/lib/validation';

// Helper to load a fixture JSON file.
function loadFixture(relativePath: string): unknown {
  const fullPath = join(__dirname, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

// Inline schema for the custom multipart upload response (POST /files/upload).
// The gateway handler returns { url, key }; there is no generated type for it
// because the route is registered outside the .api contract.
const UploadResponseSchema = z.object({
  url: z.string(),
  key: z.string(),
});

// Shape of the gateway error fixtures (status is the HTTP status recorded for
// the fixture; code is the stable snake/UPPER error code; message is user-safe).
const ErrorFixtureSchema = z.object({
  status: z.number().int(),
  code: z.string(),
  message: z.string(),
});

// ─── Auth fixtures ───────────────────────────────────────────────────────────

describe('auth fixtures', () => {
  it('login-success parses through AuthResponseSchema', () => {
    const fixture = loadFixture('auth/login-success.json');
    const parsed = AuthResponseSchema.parse(fixture);
    expect(parsed.accessToken).toBeTypeOf('string');
    expect(parsed.refreshToken).toBeTypeOf('string');
    expect(parsed.expiresIn).toBeGreaterThan(0);
    expect(parsed.user.email).toBe('fixture@example.com');
  });

  it('refresh-success parses through AuthResponseSchema', () => {
    const fixture = loadFixture('auth/refresh-success.json');
    const parsed = AuthResponseSchema.parse(fixture);
    expect(parsed.accessToken).toBeTypeOf('string');
    expect(parsed.user.id).toBe('0191fa87-6ed1-7022-9999-0123456789ae');
  });

  it('register-success parses through RegisterResponseSchema', () => {
    const fixture = loadFixture('auth/register-success.json');
    const parsed = RegisterResponseSchema.parse(fixture);
    expect(parsed.requiresVerification).toBe(true);
    expect(parsed.message).toBeTypeOf('string');
  });

  it('login-invalid-credentials has expected error shape', () => {
    const fixture = loadFixture('auth/login-invalid-credentials.json') as {
      status: number;
      code: string;
      message: string;
    };
    expect(fixture.status).toBe(401);
    expect(fixture.code).toBe('UNAUTHENTICATED');
    expect(fixture.message).toBeTypeOf('string');
  });
});

// ─── Activity fixtures ───────────────────────────────────────────────────────

describe('activity fixtures', () => {
  it('list-success parses through ActivityResponseSchema', () => {
    const fixture = loadFixture('activities/list-success.json');
    const parsed = ActivityResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(2);
    expect(parsed.page.total).toBe(2);
    expect(parsed.page.totalPages).toBe(1);
  });

  it('list-empty parses through ActivityResponseSchema', () => {
    const fixture = loadFixture('activities/list-empty.json');
    const parsed = ActivityResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(0);
    expect(parsed.page.total).toBe(0);
  });
});

// ─── Habit fixtures ──────────────────────────────────────────────────────────

describe('habit fixtures', () => {
  it('list-success parses through HabitsResponseSchema', () => {
    const fixture = loadFixture('habits/list-success.json');
    const parsed = HabitsResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(2);
    expect(parsed.page.total).toBe(2);
    expect(parsed.data[0].streak).toBe(5);
  });

  it('list-empty parses through HabitsResponseSchema', () => {
    const fixture = loadFixture('habits/list-empty.json');
    const parsed = HabitsResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(0);
    expect(parsed.page.total).toBe(0);
  });

  it('create-success parses through HabitResponseSchema', () => {
    const fixture = loadFixture('habits/create-success.json');
    const parsed = HabitResponseSchema.parse(fixture);
    expect(parsed.data.id).toBe('0192be94-1234-5678-9aaa-0987654321a3');
    expect(parsed.data.streak).toBe(0);
  });

  it('create-validation-error has expected error shape', () => {
    const fixture = loadFixture('habits/create-validation-error.json');
    const parsed = ErrorFixtureSchema.parse(fixture);
    expect(parsed.status).toBe(400);
    expect(parsed.code).toBe('INVALID_ARGUMENT');
  });
});

// ─── Goal fixtures ───────────────────────────────────────────────────────────

describe('goal fixtures', () => {
  it('list-success parses through GoalsResponseSchema', () => {
    const fixture = loadFixture('goals/list-success.json');
    const parsed = GoalsResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(2);
    expect(parsed.data[0].progress).toBe(35);
  });

  it('create-success parses through GoalResponseSchema', () => {
    const fixture = loadFixture('goals/create-success.json');
    const parsed = GoalResponseSchema.parse(fixture);
    expect(parsed.data.id).toBe('0192be94-abcd-1234-5678-0987654321b3');
    expect(parsed.data.progress).toBe(0);
  });
});

// ─── Notification fixtures ───────────────────────────────────────────────────

describe('notification fixtures', () => {
  it('list-success parses through NotificationsResponseSchema', () => {
    const fixture = loadFixture('notifications/list-success.json');
    const parsed = NotificationsResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(3);
    expect(parsed.data.filter((n) => !n.read)).toHaveLength(2);
  });

  it('unread-count parses through UnreadNotificationCountResponseSchema', () => {
    const fixture = loadFixture('notifications/unread-count.json');
    const parsed = UnreadNotificationCountResponseSchema.parse(fixture);
    expect(parsed.count).toBe(2);
  });
});

// ─── Billing fixtures ────────────────────────────────────────────────────────

describe('billing fixtures', () => {
  it('overview-free parses through BillingOverviewSchema', () => {
    const fixture = loadFixture('billing/overview-free.json');
    const parsed = BillingOverviewSchema.parse(fixture);
    expect(parsed.subscription.planCode).toBe('free');
    expect(parsed.entitlements.canUsePersonalizedAi).toBe(false);
    expect(parsed.plans).toHaveLength(2);
  });

  it('overview-pro parses through BillingOverviewSchema', () => {
    const fixture = loadFixture('billing/overview-pro.json');
    const parsed = BillingOverviewSchema.parse(fixture);
    expect(parsed.subscription.planCode).toBe('pro');
    expect(parsed.subscription.status).toBe('active');
    expect(parsed.entitlements.canUsePersonalizedAi).toBe(true);
  });
});

// ─── Search fixtures ─────────────────────────────────────────────────────────

describe('search fixtures', () => {
  it('results-success parses through SearchResponseSchema', () => {
    const fixture = loadFixture('search/results-success.json');
    const parsed = SearchResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(3);
    expect(parsed.data[0].type).toBe('article');
  });

  it('results-empty parses through SearchResponseSchema', () => {
    const fixture = loadFixture('search/results-empty.json');
    const parsed = SearchResponseSchema.parse(fixture);
    expect(parsed.data).toHaveLength(0);
    expect(parsed.page.total).toBe(0);
  });
});

// ─── Upload (custom multipart) fixtures ──────────────────────────────────────

describe('upload fixtures', () => {
  it('upload-success parses through UploadResponseSchema', () => {
    const fixture = loadFixture('uploads/upload-success.json');
    const parsed = UploadResponseSchema.parse(fixture);
    expect(parsed.url).toContain('https://cdn.example.com/uploads/');
    expect(parsed.key).toContain('uploads/');
  });

  it('upload-too-large has expected error shape', () => {
    const fixture = loadFixture('uploads/upload-too-large.json');
    const parsed = ErrorFixtureSchema.parse(fixture);
    expect(parsed.status).toBe(413);
    expect(parsed.code).toBe('INVALID_ARGUMENT');
  });
});

// ─── Sanitization checks ─────────────────────────────────────────────────────

describe('fixture sanitization', () => {
  // Patterns that must never appear in committed fixtures.
  const SECRET_PATTERNS = [
    /Bearer\s+[A-Za-z0-9._-]{20,}/, // real bearer tokens
    /sk_live_[A-Za-z0-9]+/, // Stripe live keys
    /rk_live_[A-Za-z0-9]+/, // Stripe restricted keys
    /AIza[A-Za-z0-9_-]{35}/, // Google API keys
    /\b[A-Za-z0-9._%+-]+@(?!example\.com|fixture\.com)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/, // non-fixture emails
  ];

  function loadAllFixtures(dir: string): { path: string; content: string }[] {
    const entries: { path: string; content: string }[] = [];
    for (const name of readDir(dir)) {
      const fullPath = join(dir, name);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        entries.push(...loadAllFixtures(fullPath));
      } else if (name.endsWith('.json') || name.endsWith('.sse')) {
        entries.push({ path: fullPath, content: readFileSync(fullPath, 'utf-8') });
      }
    }
    return entries;
  }

  // Minimal sync helpers to avoid importing fs.promises in vitest sync test.
  function readDir(dir: string): string[] {
    return readdirSync(dir);
  }

  it('no fixture contains real secrets or non-fixture emails', () => {
    const fixtures = loadAllFixtures(__dirname);
    expect(fixtures.length).toBeGreaterThan(0);

    for (const { path, content } of fixtures) {
      for (const pattern of SECRET_PATTERNS) {
        expect(content, `Fixture ${path} matches secret pattern ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
