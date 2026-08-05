// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ============================================
// Mocks — must be set up before importing the hook
// ============================================

const mockRouterPush = vi.fn();
const mockCreateGoal = vi.fn();
const mockCreateHabit = vi.fn();
const mockUpdateSettings = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/api', () => ({
  createGoal: (...args: unknown[]) => mockCreateGoal(...args),
  createHabit: (...args: unknown[]) => mockCreateHabit(...args),
  updateSettings: (...args: unknown[]) => mockUpdateSettings(...args),
}));

// In-memory storage for Zustand persist
const memoryStore: Record<string, string> = {};
vi.mock('@/lib/safe-storage', () => ({
  getSafeStorage: () => ({
    getItem: (key: string) => memoryStore[key] ?? null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = value;
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
  }),
}));

// ============================================
// Import the hook + store under test (after mocks)
// ============================================

const { useOnboardingSubmission } = await import(
  '@/components/onboarding/use-onboarding-submission'
);
const { useOnboardingStore } = await import('@/store/onboarding');

// ============================================
// Helpers
// ============================================

/** Create a fresh QueryClient with no retries for deterministic tests. */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
}

/** Render the hook wrapped in a QueryClientProvider (required by useMutation). */
function renderSubmissionHook() {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useOnboardingSubmission(), { wrapper });
}

/** Seed the store with a complete onboarding draft (all 7 steps filled). */
function seedStore() {
  useOnboardingStore.setState({
    step: 7,
    data: {
      goalTitle: 'Study consistently for exams',
      goalCategory: 'education',
      motivation: 'Feel confident in my exams',
      blocker: 'Lack of time',
      dailyMinutes: 30,
      accountabilityStyle: 'balanced',
      checkInTime: '09:00',
      habitSuggestions: [
        { name: 'Read 10 pages', description: 'Daily reading', selected: true },
        { name: 'Review notes', description: 'Evening review', selected: false },
        { name: 'Plan tomorrow', description: '5 min evening plan', selected: true },
      ],
    },
  });
}

// ============================================
// Tests
// ============================================

describe('useOnboardingSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOnboardingStore.getState().reset();
    seedStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------
  // Successful finish
  // -------------------------------------------
  describe('successful submission', () => {
    it('creates a goal with title, description, and category', async () => {
      mockCreateGoal.mockResolvedValue({ id: 'goal_1' });
      mockCreateHabit.mockResolvedValue({ id: 'habit_1' });
      mockUpdateSettings.mockResolvedValue({});

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      expect(mockCreateGoal).toHaveBeenCalledTimes(1);
      const goalArg = mockCreateGoal.mock.calls[0][0];
      expect(goalArg.title).toBe('Study consistently for exams');
      expect(goalArg.category).toBe('education');
      // Description includes the motivation
      expect(goalArg.description).toContain('Feel confident in my exams');
    });

    it('creates a habit for each selected habit suggestion', async () => {
      mockCreateGoal.mockResolvedValue({ id: 'goal_1' });
      mockCreateHabit.mockResolvedValue({ id: 'habit_1' });
      mockUpdateSettings.mockResolvedValue({});

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      // 2 of 3 habits are selected → 2 createHabit calls
      expect(mockCreateHabit).toHaveBeenCalledTimes(2);
      const firstHabitArg = mockCreateHabit.mock.calls[0][0];
      expect(firstHabitArg.name).toBe('Read 10 pages');
      expect(firstHabitArg.description).toBe('Daily reading');
      expect(firstHabitArg.category).toBe('education');
      const secondHabitArg = mockCreateHabit.mock.calls[1][0];
      expect(secondHabitArg.name).toBe('Plan tomorrow');
    });

    it('updates settings with accountability, check-in time, and onboardingCompleted', async () => {
      mockCreateGoal.mockResolvedValue({ id: 'goal_1' });
      mockCreateHabit.mockResolvedValue({ id: 'habit_1' });
      mockUpdateSettings.mockResolvedValue({});

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
      const settingsArg = mockUpdateSettings.mock.calls[0][0];
      expect(settingsArg.accountabilityStyle).toBe('balanced');
      expect(settingsArg.checkInTime).toBe('09:00');
      expect(settingsArg.onboardingCompleted).toBe(true);
    });

    it('resets the store and navigates to /plan on success', async () => {
      mockCreateGoal.mockResolvedValue({ id: 'goal_1' });
      mockCreateHabit.mockResolvedValue({ id: 'habit_1' });
      mockUpdateSettings.mockResolvedValue({});

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/plan');
      });
      // Store should be reset
      expect(useOnboardingStore.getState().step).toBe(1);
      expect(useOnboardingStore.getState().data.goalTitle).toBe('');
    });

    it('clears any previous error before submitting', async () => {
      useOnboardingStore.getState().setError('previous error');
      mockCreateGoal.mockResolvedValue({ id: 'goal_1' });
      mockCreateHabit.mockResolvedValue({ id: 'habit_1' });
      mockUpdateSettings.mockResolvedValue({});

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      expect(useOnboardingStore.getState().error).toBeNull();
    });
  });

  // -------------------------------------------
  // Error handling
  // -------------------------------------------
  describe('error handling', () => {
    it('sets an error message and does NOT navigate when createGoal fails', async () => {
      mockCreateGoal.mockRejectedValue(new Error('goal failed'));

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      expect(useOnboardingStore.getState().error).toBe(
        'Something went wrong. Please try again.',
      );
      expect(mockRouterPush).not.toHaveBeenCalled();
      // Store should NOT be reset
      expect(useOnboardingStore.getState().data.goalTitle).toBe(
        'Study consistently for exams',
      );
    });

    it('sets an error when createHabit fails', async () => {
      mockCreateGoal.mockResolvedValue({ id: 'goal_1' });
      mockCreateHabit.mockRejectedValue(new Error('habit failed'));

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      expect(useOnboardingStore.getState().error).toBe(
        'Something went wrong. Please try again.',
      );
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('sets an error when updateSettings fails', async () => {
      mockCreateGoal.mockResolvedValue({ id: 'goal_1' });
      mockCreateHabit.mockResolvedValue({ id: 'habit_1' });
      mockUpdateSettings.mockRejectedValue(new Error('settings failed'));

      const { result } = renderSubmissionHook();
      await act(async () => {
        await result.current.handleFinish();
      });

      expect(useOnboardingStore.getState().error).toBe(
        'Something went wrong. Please try again.',
      );
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // Dedup via ref
  // -------------------------------------------
  describe('deduplication', () => {
    it('does not start a second submission while one is in flight', async () => {
      let resolveGoal!: (v: unknown) => void;
      mockCreateGoal.mockReturnValue(
        new Promise((resolve) => {
          resolveGoal = resolve;
        }),
      );
      mockCreateHabit.mockResolvedValue({ id: 'h' });
      mockUpdateSettings.mockResolvedValue({});

      const { result } = renderSubmissionHook();
      let first!: Promise<void>;
      let second!: Promise<void>;
      act(() => {
        first = result.current.handleFinish();
        second = result.current.handleFinish(); // should be a no-op
      });

      // Wait for the first submission's createGoal to fire, then confirm the
      // second call did NOT trigger another one.
      await waitFor(() => {
        expect(mockCreateGoal).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        resolveGoal({ id: 'goal_1' });
        await first;
        await second;
      });

      // Still only one call after both promises settle.
      expect(mockCreateGoal).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------
  // isPending state
  // -------------------------------------------
  describe('isSubmitting state', () => {
    it('reports isSubmitting as false initially', () => {
      const { result } = renderSubmissionHook();
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
