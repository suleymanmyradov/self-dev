import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., productivity, health, mindfulness
  dueDate?: string; // ISO date
  progress: number; // 0-100
  completed: boolean;
  relatedHabitIds?: string[];
};

export type GoalsState = {
  goals: Goal[];
  hasHydrated: boolean;
  add: (g: Omit<Goal, "id" | "completed"> & Partial<Pick<Goal, "completed">>) => void;
  update: (id: string, patch: Partial<Goal>) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
};

export const useGoals = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],
      hasHydrated: false,
      add: (g) =>
        set((state) => ({
          goals: [
            {
              id: `g_${Date.now()}`,
              completed: g.completed ?? false,
              progress: Math.max(0, Math.min(100, g.progress ?? 0)),
              ...g,
            },
            ...state.goals,
          ],
        })),
      update: (id, patch) =>
        set((state) => ({ goals: state.goals.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      remove: (id) => set((state) => ({ goals: state.goals.filter((x) => x.id !== id) })),
      toggle: (id) =>
        set((state) => ({
          goals: state.goals.map((x) =>
            x.id === id ? { ...x, completed: !x.completed, progress: !x.completed ? 100 : 0 } : x,
          ),
        })),
    }),
    {
      name: "goals",
      onRehydrateStorage: () => () => {
        Promise.resolve().then(() => {
          useGoals.setState({ hasHydrated: true });
        });
      },
    },
  ),
);
