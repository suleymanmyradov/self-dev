// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

// ============================================
// Mocks — must be set up before importing the hook
// ============================================

const mockGenerateOnboardingHabits = vi.fn();

vi.mock('@/api', () => ({
  generateOnboardingHabits: (...args: unknown[]) =>
    mockGenerateOnboardingHabits(...args),
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

const { useHabitGeneration } = await import('@/components/onboarding/use-habit-generation');
const { useOnboardingStore } = await import('@/store/onboarding');

// ============================================
// Helpers
// ============================================

/** Render the hook. No provider needed — the hook only uses the store + API. */
function renderHabitGenerationHook() {
  return renderHook(() => useHabitGeneration(), {
    wrapper: ({ children }: { children: ReactNode }) => children,
  });
}

/** Seed the store with realistic onboarding data (steps 1–6 filled). */
function seedStore() {
  useOnboardingStore.setState({
    data: {
      goalTitle: 'Study consistently for exams',
      goalCategory: 'education',
      motivation: 'Feel confident in my exams',
      blocker: 'Lack of time',
      dailyMinutes: 30,
      accountabilityStyle: 'balanced',
      checkInTime: '09:00',
      habitSuggestions: [],
    },
  });
}

// ============================================
// Tests
// ============================================

describe('useHabitGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOnboardingStore.getState().reset();
    seedStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------
  // Successful generation
  // -------------------------------------------
  describe('successful habit generation', () => {
    it('calls generateOnboardingHabits with onboarding data', async () => {
      mockGenerateOnboardingHabits.mockResolvedValue([
        { name: 'Habit A', description: 'Desc A' },
        { name: 'Habit B', description: 'Desc B' },
        { name: 'Habit C', description: 'Desc C' },
      ]);

      const { result } = renderHabitGenerationHook();
      await act(async () => {
        await result.current.generateHabits();
      });

      expect(mockGenerateOnboardingHabits).toHaveBeenCalledTimes(1);
      const arg = mockGenerateOnboardingHabits.mock.calls[0][0];
      expect(arg.goalTitle).toBe('Study consistently for exams');
      expect(arg.goalCategory).toBe('education');
      expect(arg.motivation).toBe('Feel confident in my exams');
      expect(arg.blocker).toBe('Lack of time');
      expect(arg.dailyMinutes).toBe(30);
      expect(arg.accountabilityStyle).toBe('balanced');
    });

    it('stores up to 3 suggestions, all selected by default', async () => {
      mockGenerateOnboardingHabits.mockResolvedValue([
        { name: 'Habit A', description: 'Desc A' },
        { name: 'Habit B', description: 'Desc B' },
        { name: 'Habit C', description: 'Desc C' },
        { name: 'Habit D', description: 'Desc D' }, // should be dropped (slice 3)
      ]);

      const { result } = renderHabitGenerationHook();
      await act(async () => {
        await result.current.generateHabits();
      });

      const suggestions = useOnboardingStore.getState().data.habitSuggestions;
      expect(suggestions).toHaveLength(3);
      expect(suggestions.every((s) => s.selected)).toBe(true);
      expect(suggestions[0].name).toBe('Habit A');
      expect(suggestions[2].name).toBe('Habit C');
    });

    it('sets loadingHabits true during generation then false after', async () => {
      let resolveGeneration!: (v: unknown[]) => void;
      mockGenerateOnboardingHabits.mockReturnValue(
        new Promise((resolve) => {
          resolveGeneration = resolve;
        }),
      );

      const { result } = renderHabitGenerationHook();
      let generationPromise!: Promise<void>;
      act(() => {
        generationPromise = result.current.generateHabits();
      });

      // While the API call is pending, loading should be true.
      await waitFor(() => {
        expect(useOnboardingStore.getState().loadingHabits).toBe(true);
      });

      await act(async () => {
        resolveGeneration([
          { name: 'A', description: 'd' },
          { name: 'B', description: 'd' },
          { name: 'C', description: 'd' },
        ]);
        await generationPromise;
      });

      expect(useOnboardingStore.getState().loadingHabits).toBe(false);
    });

    it('clears any previous error before generating', async () => {
      useOnboardingStore.getState().setError('previous error');
      mockGenerateOnboardingHabits.mockResolvedValue([
        { name: 'A', description: 'd' },
        { name: 'B', description: 'd' },
        { name: 'C', description: 'd' },
      ]);

      const { result } = renderHabitGenerationHook();
      await act(async () => {
        await result.current.generateHabits();
      });

      expect(useOnboardingStore.getState().error).toBeNull();
    });
  });

  // -------------------------------------------
  // Error fallback
  // -------------------------------------------
  describe('error fallback', () => {
    it('uses fallback habits when the API throws', async () => {
      mockGenerateOnboardingHabits.mockRejectedValue(new Error('AI unavailable'));

      const { result } = renderHabitGenerationHook();
      await act(async () => {
        await result.current.generateHabits();
      });

      const suggestions = useOnboardingStore.getState().data.habitSuggestions;
      expect(suggestions).toHaveLength(3);
      expect(suggestions.every((s) => s.selected)).toBe(true);
      // First fallback habit references the goal title + daily minutes
      expect(suggestions[0].name).toContain('Study consistently for exams');
      expect(suggestions[0].name).toContain('10 minutes'); // 30/3 = 10
    });

    it('clears loadingHabits even on error', async () => {
      mockGenerateOnboardingHabits.mockRejectedValue(new Error('fail'));

      const { result } = renderHabitGenerationHook();
      await act(async () => {
        await result.current.generateHabits();
      });

      expect(useOnboardingStore.getState().loadingHabits).toBe(false);
    });
  });

  // -------------------------------------------
  // Dedup via ref
  // -------------------------------------------
  describe('deduplication', () => {
    it('does not start a second generation while one is in flight', async () => {
      let resolveGeneration!: (v: unknown[]) => void;
      mockGenerateOnboardingHabits.mockReturnValue(
        new Promise((resolve) => {
          resolveGeneration = resolve;
        }),
      );

      const { result } = renderHabitGenerationHook();
      let first!: Promise<void>;
      let second!: Promise<void>;
      act(() => {
        first = result.current.generateHabits();
        second = result.current.generateHabits(); // should be a no-op
      });

      // Only one API call should have been made
      expect(mockGenerateOnboardingHabits).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveGeneration([
          { name: 'A', description: 'd' },
          { name: 'B', description: 'd' },
          { name: 'C', description: 'd' },
        ]);
        await first;
        await second;
      });
    });

    it('allows a new generation after the previous one completes', async () => {
      mockGenerateOnboardingHabits.mockResolvedValue([
        { name: 'A', description: 'd' },
        { name: 'B', description: 'd' },
        { name: 'C', description: 'd' },
      ]);

      const { result } = renderHabitGenerationHook();
      await act(async () => {
        await result.current.generateHabits();
      });
      await act(async () => {
        await result.current.generateHabits();
      });

      expect(mockGenerateOnboardingHabits).toHaveBeenCalledTimes(2);
    });
  });
});
