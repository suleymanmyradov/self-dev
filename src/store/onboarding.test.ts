import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================
// Mocks — must be set up before importing the store
// ============================================

// In-memory storage for Zustand persist (jsdom's localStorage may be
// unavailable depending on the Node version).
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
// Import the store under test (after mocks)
// ============================================

const { useOnboardingStore, TOTAL_STEPS } = await import('@/store/onboarding');

// ============================================
// Helpers
// ============================================

/** Read the current store state without subscribing to updates. */
function getState() {
  return useOnboardingStore.getState();
}

/** Reset the store to its initial state before each test. */
function resetStore() {
  useOnboardingStore.getState().reset();
}

// ============================================
// Tests
// ============================================

describe('onboarding store', () => {
  beforeEach(() => {
    resetStore();
  });

  // -------------------------------------------
  // Initial state
  // -------------------------------------------
  describe('initial state', () => {
    it('starts on step 1', () => {
      expect(getState().step).toBe(1);
    });

    it('has the correct total steps constant', () => {
      expect(TOTAL_STEPS).toBe(7);
    });

    it('starts with empty goal title and category', () => {
      expect(getState().data.goalTitle).toBe('');
      expect(getState().data.goalCategory).toBe('');
    });

    it('defaults dailyMinutes to 30', () => {
      expect(getState().data.dailyMinutes).toBe(30);
    });

    it('defaults accountabilityStyle to balanced', () => {
      expect(getState().data.accountabilityStyle).toBe('balanced');
    });

    it('defaults checkInTime to 09:00', () => {
      expect(getState().data.checkInTime).toBe('09:00');
    });

    it('starts with empty habit suggestions', () => {
      expect(getState().data.habitSuggestions).toEqual([]);
    });

    it('starts with loadingHabits false and no error', () => {
      expect(getState().loadingHabits).toBe(false);
      expect(getState().error).toBeNull();
    });
  });

  // -------------------------------------------
  // Field updates
  // -------------------------------------------
  describe('updateField', () => {
    it('updates a string field (goalTitle)', () => {
      useOnboardingStore.getState().updateField('goalTitle', 'Study for exams');
      expect(getState().data.goalTitle).toBe('Study for exams');
    });

    it('updates goalCategory', () => {
      useOnboardingStore.getState().updateField('goalCategory', 'education');
      expect(getState().data.goalCategory).toBe('education');
    });

    it('updates motivation', () => {
      useOnboardingStore.getState().updateField('motivation', 'Feel confident');
      expect(getState().data.motivation).toBe('Feel confident');
    });

    it('updates blocker', () => {
      useOnboardingStore.getState().updateField('blocker', 'Lack of time');
      expect(getState().data.blocker).toBe('Lack of time');
    });

    it('updates dailyMinutes (number)', () => {
      useOnboardingStore.getState().updateField('dailyMinutes', 45);
      expect(getState().data.dailyMinutes).toBe(45);
    });

    it('updates accountabilityStyle', () => {
      useOnboardingStore.getState().updateField('accountabilityStyle', 'strict');
      expect(getState().data.accountabilityStyle).toBe('strict');
    });

    it('updates checkInTime', () => {
      useOnboardingStore.getState().updateField('checkInTime', '18:00');
      expect(getState().data.checkInTime).toBe('18:00');
    });

    it('preserves other fields when updating one', () => {
      useOnboardingStore.getState().updateField('goalTitle', 'Read more');
      useOnboardingStore.getState().updateField('motivation', 'Learn faster');
      expect(getState().data.goalTitle).toBe('Read more');
      expect(getState().data.motivation).toBe('Learn faster');
      // Untouched fields keep their defaults
      expect(getState().data.dailyMinutes).toBe(30);
    });
  });

  // -------------------------------------------
  // Step navigation
  // -------------------------------------------
  describe('nextStep', () => {
    it('increments the step by 1', () => {
      useOnboardingStore.getState().nextStep();
      expect(getState().step).toBe(2);
    });

    it('clamps at TOTAL_STEPS', () => {
      for (let i = 0; i < TOTAL_STEPS; i++) {
        useOnboardingStore.getState().nextStep();
      }
      expect(getState().step).toBe(TOTAL_STEPS);
    });
  });

  describe('prevStep', () => {
    it('decrements the step by 1', () => {
      useOnboardingStore.getState().nextStep();
      useOnboardingStore.getState().nextStep();
      useOnboardingStore.getState().prevStep();
      expect(getState().step).toBe(2);
    });

    it('clamps at step 1', () => {
      useOnboardingStore.getState().prevStep();
      expect(getState().step).toBe(1);
    });
  });

  describe('goToStep', () => {
    it('jumps to the specified step', () => {
      useOnboardingStore.getState().goToStep(5);
      expect(getState().step).toBe(5);
    });

    it('clamps below 1', () => {
      useOnboardingStore.getState().goToStep(-3);
      expect(getState().step).toBe(1);
    });

    it('clamps above TOTAL_STEPS', () => {
      useOnboardingStore.getState().goToStep(99);
      expect(getState().step).toBe(TOTAL_STEPS);
    });
  });

  // -------------------------------------------
  // Habit suggestions
  // -------------------------------------------
  describe('setHabitSuggestions', () => {
    it('replaces the habit suggestions array', () => {
      const suggestions = [
        { name: 'Read 10 pages', description: 'Daily reading', selected: true },
        { name: 'Review notes', description: 'Evening review', selected: false },
      ];
      useOnboardingStore.getState().setHabitSuggestions(suggestions);
      expect(getState().data.habitSuggestions).toEqual(suggestions);
    });
  });

  describe('toggleHabitSelection', () => {
    it('flips selected from true to false', () => {
      useOnboardingStore.getState().setHabitSuggestions([
        { name: 'A', description: 'desc', selected: true },
        { name: 'B', description: 'desc', selected: true },
      ]);
      useOnboardingStore.getState().toggleHabitSelection(0);
      expect(getState().data.habitSuggestions[0].selected).toBe(false);
      expect(getState().data.habitSuggestions[1].selected).toBe(true);
    });

    it('flips selected from false to true', () => {
      useOnboardingStore.getState().setHabitSuggestions([
        { name: 'A', description: 'desc', selected: false },
      ]);
      useOnboardingStore.getState().toggleHabitSelection(0);
      expect(getState().data.habitSuggestions[0].selected).toBe(true);
    });

    it('does nothing for an out-of-range index', () => {
      useOnboardingStore.getState().setHabitSuggestions([
        { name: 'A', description: 'desc', selected: true },
      ]);
      useOnboardingStore.getState().toggleHabitSelection(5);
      expect(getState().data.habitSuggestions[0].selected).toBe(true);
    });
  });

  // -------------------------------------------
  // Loading / error state
  // -------------------------------------------
  describe('setLoadingHabits', () => {
    it('sets loadingHabits to true', () => {
      useOnboardingStore.getState().setLoadingHabits(true);
      expect(getState().loadingHabits).toBe(true);
    });

    it('sets loadingHabits to false', () => {
      useOnboardingStore.getState().setLoadingHabits(true);
      useOnboardingStore.getState().setLoadingHabits(false);
      expect(getState().loadingHabits).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets an error message', () => {
      useOnboardingStore.getState().setError('Something went wrong');
      expect(getState().error).toBe('Something went wrong');
    });

    it('clears the error with null', () => {
      useOnboardingStore.getState().setError('Something went wrong');
      useOnboardingStore.getState().setError(null);
      expect(getState().error).toBeNull();
    });
  });

  // -------------------------------------------
  // Reset
  // -------------------------------------------
  describe('reset', () => {
    it('resets step to 1', () => {
      useOnboardingStore.getState().goToStep(7);
      useOnboardingStore.getState().reset();
      expect(getState().step).toBe(1);
    });

    it('resets all data fields to initial values', () => {
      useOnboardingStore.getState().updateField('goalTitle', 'Test');
      useOnboardingStore.getState().updateField('dailyMinutes', 60);
      useOnboardingStore.getState().setHabitSuggestions([
        { name: 'A', description: 'd', selected: true },
      ]);
      useOnboardingStore.getState().reset();
      const data = getState().data;
      expect(data.goalTitle).toBe('');
      expect(data.dailyMinutes).toBe(30);
      expect(data.habitSuggestions).toEqual([]);
      expect(data.accountabilityStyle).toBe('balanced');
      expect(data.checkInTime).toBe('09:00');
    });

    it('resets loadingHabits and error', () => {
      useOnboardingStore.getState().setLoadingHabits(true);
      useOnboardingStore.getState().setError('err');
      useOnboardingStore.getState().reset();
      expect(getState().loadingHabits).toBe(false);
      expect(getState().error).toBeNull();
    });
  });
});
