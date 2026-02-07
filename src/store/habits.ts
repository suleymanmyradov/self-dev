 'use client';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Habit } from "@/lib/types-data";
import { getSafeStorage } from "@/lib/safe-storage";

export type HabitCategory = "productivity" | "health" | "mindfulness" | string;

export type HabitsState = {
  habits: Habit[];
  hasHydrated: boolean;
  add: (habit: Omit<Habit, "id" | "streak" | "completed"> & Partial<Pick<Habit, "streak" | "completed">>) => void;
  toggle: (id: string) => void;
  update: (id: string, patch: Partial<Habit>) => void;
  remove: (id: string) => void;
  resetToday: () => void;
};

export const useHabits = create<HabitsState>()(
  persist(
    (set) => ({
      habits: [],
      hasHydrated: false,
      add: (habit) =>
        set((state) => {
          const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          return {
            habits: [
              {
                id,
                streak: habit.streak ?? 0,
                completed: habit.completed ?? false,
                ...habit,
              },
              ...state.habits,
            ],
          };
        }),
      toggle: (id) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completed: !h.completed,
                  streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1),
                }
              : h,
          ),
        })),
      update: (id, patch) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      remove: (id) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
      resetToday: () =>
        set((state) => ({ habits: state.habits.map((h) => ({ ...h, completed: false })) })),
    }),
    {
      name: "habits",
      storage: createJSONStorage(getSafeStorage),
      onRehydrateStorage: () => (state, error) => {
        // called after hydration (or error)
        if (!error) {
          // mark hydrated on next tick to ensure subscribers update
          Promise.resolve().then(() => {
            useHabits.setState({ hasHydrated: true });
          });
        } else {
          useHabits.setState({ hasHydrated: true });
        }
      },
    },
  ),
);
