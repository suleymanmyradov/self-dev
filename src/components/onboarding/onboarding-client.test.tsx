// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================
// Mocks — must be set up before importing the component
// ============================================

const mockRouterPush = vi.fn();
const mockGenerateHabits = vi.fn();
const mockHandleFinish = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), refresh: vi.fn() }),
}));

// Mock useCategories to return controlled DB categories
const mockCategories = [
  { id: '1', name: 'Education', slug: 'education', sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Health', slug: 'health', sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Career', slug: 'career', sortOrder: 3, createdAt: '', updatedAt: '' },
];
vi.mock('@/hooks', () => ({
  useCategories: () => ({ data: mockCategories }),
}));

// Mock the habit generation hook
vi.mock('@/components/onboarding/use-habit-generation', () => ({
  useHabitGeneration: () => ({ generateHabits: mockGenerateHabits }),
}));

// Mock the submission hook
vi.mock('@/components/onboarding/use-onboarding-submission', () => ({
  useOnboardingSubmission: () => ({
    isSubmitting: false,
    handleFinish: mockHandleFinish,
  }),
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
// Import the component + store under test (after mocks)
// ============================================

const { OnboardingClient } = await import('@/components/onboarding/onboarding-client');
const { useOnboardingStore } = await import('@/store/onboarding');

// ============================================
// Helpers
// ============================================

/** Reset the store to initial state before each test. */
function resetStore() {
  useOnboardingStore.getState().reset();
}

/** Jump to a step and seed minimal data so the step renders. */
function goToStep(step: number) {
  useOnboardingStore.getState().goToStep(step);
}

// ============================================
// Tests
// ============================================

describe('OnboardingClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------
  // Step 1 — Goal title + category
  // -------------------------------------------
  describe('step 1: goal + category', () => {
    it('renders the goal heading and goal input', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('What are you hoping changes?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Study consistently/i)).toBeInTheDocument();
    });

    it('renders DB category buttons', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('Career')).toBeInTheDocument();
    });

    it('shows "Skip setup" on step 1 (not Back)', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('Skip setup')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });

    it('disables Continue when goal title is too short (< 3 chars)', () => {
      render(<OnboardingClient />);
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).toBeDisabled();
    });

    it('enables Continue when goal title has >= 3 chars', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.type(screen.getByPlaceholderText(/Study consistently/i), 'Read more books');
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
      });
    });

    it('selecting a category updates the store', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.click(screen.getByText('Education'));
      expect(useOnboardingStore.getState().data.goalCategory).toBe('education');
    });

    it('Skip setup resets the store and navigates to /plan', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      // Type something so the store has data
      await user.type(screen.getByPlaceholderText(/Study consistently/i), 'Test goal');
      await user.click(screen.getByText('Skip setup'));
      expect(mockRouterPush).toHaveBeenCalledWith('/plan');
      expect(useOnboardingStore.getState().data.goalTitle).toBe('');
    });
  });

  // -------------------------------------------
  // Step 2 — Motivation
  // -------------------------------------------
  describe('step 2: motivation', () => {
    beforeEach(() => {
      goToStep(2);
    });

    it('renders the motivation heading and textarea', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('Why does this matter to you?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/feel confident/i)).toBeInTheDocument();
    });

    it('disables Continue when motivation is too short', () => {
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });

    it('enables Continue when motivation has >= 3 chars', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.type(screen.getByPlaceholderText(/feel confident/i), 'To grow everyday');
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
      });
    });
  });

  // -------------------------------------------
  // Step 3 — Blocker
  // -------------------------------------------
  describe('step 3: blocker', () => {
    beforeEach(() => {
      goToStep(3);
    });

    it('renders the blocker heading and options', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('What usually stops you?')).toBeInTheDocument();
      expect(screen.getByText('Lack of time')).toBeInTheDocument();
      expect(screen.getByText('Low motivation')).toBeInTheDocument();
      expect(screen.getByText('Too distracted')).toBeInTheDocument();
      expect(screen.getByText('Unclear plan')).toBeInTheDocument();
    });

    it('Continue is always enabled (blocker is optional)', () => {
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
    });

    it('selecting a blocker updates the store', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.click(screen.getByText('Lack of time'));
      expect(useOnboardingStore.getState().data.blocker).toBe('Lack of time');
    });

    it('clicking "Something else…" reveals the free-text input', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.click(screen.getByText(/something else/i));
      expect(screen.getByPlaceholderText(/describe your main blocker/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------
  // Step 4 — Daily time commitment
  // -------------------------------------------
  describe('step 4: commitment', () => {
    beforeEach(() => {
      goToStep(4);
    });

    it('renders the commitment heading and minute options', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('How much time, honestly?')).toBeInTheDocument();
      expect(screen.getByText('15 min')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('1 hour')).toBeInTheDocument();
    });

    it('Continue is always enabled (commitment has a default)', () => {
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
    });

    it('selecting a minute value updates the store', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.click(screen.getByText('45 min'));
      expect(useOnboardingStore.getState().data.dailyMinutes).toBe(45);
    });
  });

  // -------------------------------------------
  // Step 5 — Accountability style
  // -------------------------------------------
  describe('step 5: accountability', () => {
    beforeEach(() => {
      goToStep(5);
    });

    it('renders the accountability heading and style labels', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('How should I hold you accountable?')).toBeInTheDocument();
      expect(screen.getByText('Gentle')).toBeInTheDocument();
      expect(screen.getByText('Balanced')).toBeInTheDocument();
      expect(screen.getByText('Strict')).toBeInTheDocument();
    });

    it('Continue is always enabled (style has a default)', () => {
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
    });

    it('selecting a style updates the store', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.click(screen.getByText('Strict'));
      expect(useOnboardingStore.getState().data.accountabilityStyle).toBe('strict');
    });
  });

  // -------------------------------------------
  // Step 6 — Check-in time
  // -------------------------------------------
  describe('step 6: check-in time', () => {
    beforeEach(() => {
      goToStep(6);
    });

    it('renders the check-in heading and time buttons', () => {
      render(<OnboardingClient />);
      expect(screen.getByText('When should I check in with you?')).toBeInTheDocument();
      expect(screen.getByText('06:00')).toBeInTheDocument();
      expect(screen.getByText('09:00')).toBeInTheDocument();
      expect(screen.getByText('21:00')).toBeInTheDocument();
    });

    it('Continue is always enabled (time has a default)', () => {
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
    });

    it('selecting a time updates the store', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.click(screen.getByText('18:00'));
      expect(useOnboardingStore.getState().data.checkInTime).toBe('18:00');
    });

    it('clicking Continue calls generateHabits and advances to step 7', async () => {
      const user = userEvent.setup();
      mockGenerateHabits.mockResolvedValue(undefined);
      render(<OnboardingClient />);
      await user.click(screen.getByRole('button', { name: /continue/i }));
      await waitFor(() => {
        expect(mockGenerateHabits).toHaveBeenCalledTimes(1);
      });
      expect(useOnboardingStore.getState().step).toBe(7);
    });
  });

  // -------------------------------------------
  // Step 7 — Habit suggestions (summary)
  // -------------------------------------------
  describe('step 7: habit summary', () => {
    beforeEach(() => {
      goToStep(7);
      useOnboardingStore.getState().setHabitSuggestions([
        { name: 'Read 10 pages', description: 'Daily reading', selected: true },
        { name: 'Review notes', description: 'Evening review', selected: true },
        { name: 'Plan tomorrow', description: '5 min plan', selected: false },
      ]);
    });

    it('renders the summary heading and habit suggestions', () => {
      render(<OnboardingClient />);
      expect(screen.getByText(/smallest version that works/i)).toBeInTheDocument();
      expect(screen.getByText('Read 10 pages')).toBeInTheDocument();
      expect(screen.getByText('Review notes')).toBeInTheDocument();
      expect(screen.getByText('Plan tomorrow')).toBeInTheDocument();
    });

    it('shows the finish button labeled "Start tomorrow morning"', () => {
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /start tomorrow morning/i })).toBeInTheDocument();
    });

    it('disables finish when no habits are selected', () => {
      useOnboardingStore.getState().setHabitSuggestions([
        { name: 'A', description: 'd', selected: false },
        { name: 'B', description: 'd', selected: false },
      ]);
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /start tomorrow morning/i })).toBeDisabled();
    });

    it('enables finish when at least one habit is selected', () => {
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /start tomorrow morning/i })).toBeEnabled();
    });

    it('toggling a habit updates its selected state', async () => {
      const user = userEvent.setup();
      render(<OnboardingClient />);
      await user.click(screen.getByText('Read 10 pages'));
      expect(useOnboardingStore.getState().data.habitSuggestions[0].selected).toBe(false);
    });

    it('clicking finish calls handleFinish', async () => {
      const user = userEvent.setup();
      mockHandleFinish.mockResolvedValue(undefined);
      render(<OnboardingClient />);
      await user.click(screen.getByRole('button', { name: /start tomorrow morning/i }));
      await waitFor(() => {
        expect(mockHandleFinish).toHaveBeenCalledTimes(1);
      });
    });

    it('shows the loading spinner when loadingHabits is true', () => {
      useOnboardingStore.getState().setLoadingHabits(true);
      render(<OnboardingClient />);
      expect(screen.getByText('Building your habit plan...')).toBeInTheDocument();
    });

    it('shows an error message when error is set', () => {
      useOnboardingStore.getState().setError('AI service unavailable');
      render(<OnboardingClient />);
      expect(screen.getByText('AI service unavailable')).toBeInTheDocument();
    });
  });

  // -------------------------------------------
  // Navigation (Back / Next)
  // -------------------------------------------
  describe('navigation', () => {
    it('shows Back button on steps 2–7 (not Skip)', () => {
      goToStep(3);
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.queryByText('Skip setup')).not.toBeInTheDocument();
    });

    it('Back button decrements the step', async () => {
      const user = userEvent.setup();
      goToStep(3);
      render(<OnboardingClient />);
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(useOnboardingStore.getState().step).toBe(2);
    });

    it('Continue button increments the step when canProceed is true', async () => {
      const user = userEvent.setup();
      // Step 3 (blocker) — canProceed is always true
      goToStep(3);
      render(<OnboardingClient />);
      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(useOnboardingStore.getState().step).toBe(4);
    });

    it('shows "Step X of 7" progress label', () => {
      goToStep(4);
      render(<OnboardingClient />);
      expect(screen.getByText(/step 4 of 7/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------
  // Loading state during habit generation
  // -------------------------------------------
  describe('loading state', () => {
    it('Continue button shows "Building plan..." when loadingHabits is true', () => {
      goToStep(6);
      useOnboardingStore.getState().setLoadingHabits(true);
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /building plan/i })).toBeDisabled();
    });

    it('Continue button is disabled when loadingHabits is true', () => {
      goToStep(4);
      useOnboardingStore.getState().setLoadingHabits(true);
      render(<OnboardingClient />);
      expect(screen.getByRole('button', { name: /building plan/i })).toBeDisabled();
    });
  });
});
