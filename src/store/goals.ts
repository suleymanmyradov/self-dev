"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSafeStorage } from "@/lib/safe-storage";

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
    (set) => ({
      goals: [],
      hasHydrated: false,
      add: (g) =>
        set((state) => {
          const id =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? (crypto as Crypto).randomUUID()
              : `g_${Date.now()}_${Math.random().toString(36).slice(2, 11)}_${Math.random().toString(36).slice(2, 11)}`;
          
          // Check if ID already exists (shouldn't happen, but safeguard)
          if (state.goals.some(goal => goal.id === id)) {
            console.warn(`Duplicate goal ID detected: ${id}`);
            return state;
          }
          
          return {
            goals: [
              {
                ...g,
                id,
                completed: g.completed ?? false,
                progress: Math.max(0, Math.min(100, g.progress ?? 0)),
              },
              ...state.goals,
            ],
          };
        }),
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
      storage: createJSONStorage(getSafeStorage),
      onRehydrateStorage: () => (state) => {
        // Deduplicate goals by ID in case of corrupted storage
        if (state?.goals) {
          const seenIds = new Set<string>();
          const uniqueGoals = state.goals.filter((goal) => {
            if (seenIds.has(goal.id)) {
              console.warn(`Removing duplicate goal with ID: ${goal.id}`);
              return false;
            }
            seenIds.add(goal.id);
            return true;
          });
          
          if (uniqueGoals.length !== state.goals.length) {
            useGoals.setState({ goals: uniqueGoals });
          }
        }
        
        Promise.resolve().then(() => {
          useGoals.setState({ hasHydrated: true });
        });
      },
    },
  ),
);
