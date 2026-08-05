// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ============================================
// Mocks — must be set up before importing the page
// ============================================

// In real Next.js, redirect() throws a NEXT_REDIRECT error that the framework
// catches to perform the navigation. We mimic that here so the page stops
// rendering after redirect() is called (matching production behavior).
const REDIRECT_ERROR = Symbol('NEXT_REDIRECT');
const mockRedirect = vi.fn((path: string) => {
  void path;
  throw REDIRECT_ERROR;
});

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

// Mock getSettingsServer to control the settings payload
const mockGetSettingsServer = vi.fn<() => Promise<unknown>>();

vi.mock('@/api/server', () => ({
  getSettingsServer: () => mockGetSettingsServer(),
}));

// Mock swallowNotFound to just await the promise and return its result
// (or fallback on rejection). Avoids the 'server-only' import.
vi.mock('@/lib/server-data', () => ({
  swallowNotFound: async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
    try {
      return await promise;
    } catch {
      return fallback;
    }
  },
}));

// Mock OnboardingClient to a simple marker so we can assert it renders
vi.mock('@/components/onboarding/onboarding-client', () => ({
  OnboardingClient: () => <div data-testid="onboarding-client">OnboardingClient</div>,
}));

// ============================================
// Import the page under test (after mocks)
// ============================================

const OnboardingPage = (await import('@/app/onboarding/page')).default;

// ============================================
// Helpers
// ============================================

/** A settings payload with onboardingCompleted: true. */
function completedSettings() {
  return {
    data: {
      id: 'set_1',
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      accountabilityStyle: 'balanced',
      checkInTime: '09:00',
      onboardingCompleted: true,
      userId: 'usr_1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  };
}

/** A settings payload with onboardingCompleted: false. */
function incompleteSettings() {
  return {
    data: {
      ...completedSettings().data,
      onboardingCompleted: false,
    },
  };
}

// ============================================
// Tests
// ============================================

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------
  // Redirect when onboarding already completed
  // -------------------------------------------
  describe('redirect when completed', () => {
    it('redirects to /plan when onboardingCompleted is true', async () => {
      mockGetSettingsServer.mockResolvedValue(completedSettings());

      // redirect() throws (mimicking Next.js), so OnboardingPage() rejects.
      await expect(OnboardingPage()).rejects.toBe(REDIRECT_ERROR);
      expect(mockRedirect).toHaveBeenCalledWith('/plan');
    });

    it('does NOT render OnboardingClient when redirecting', async () => {
      mockGetSettingsServer.mockResolvedValue(completedSettings());

      // The page throws before returning any JSX, so there is nothing to render.
      await expect(OnboardingPage()).rejects.toBe(REDIRECT_ERROR);
      expect(screen.queryByTestId('onboarding-client')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------
  // Render OnboardingClient when not completed
  // -------------------------------------------
  describe('render client when not completed', () => {
    it('renders OnboardingClient when onboardingCompleted is false', async () => {
      mockGetSettingsServer.mockResolvedValue(incompleteSettings());

      render(await OnboardingPage());

      expect(screen.getByTestId('onboarding-client')).toBeInTheDocument();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // 404 (no settings yet) — allow onboarding
  // -------------------------------------------
  describe('no settings yet (404)', () => {
    it('renders OnboardingClient when settings 404 (swallowed to null)', async () => {
      // swallowNotFound returns the fallback (null) on rejection
      mockGetSettingsServer.mockRejectedValue(new Error('404'));

      render(await OnboardingPage());

      expect(screen.getByTestId('onboarding-client')).toBeInTheDocument();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
