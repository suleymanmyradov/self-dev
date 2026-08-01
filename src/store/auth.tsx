'use client'

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '@/lib/safe-storage';
import type { Profile } from '@/api';

/**
 * Auth tokens live exclusively in httpOnly cookies managed by the server
 * (middleware + BFF proxy). The client only tracks who is logged in — never the
 * tokens themselves — which keeps them out of JS-accessible storage (XSS-safe).
 */
export type AuthState = {
  user: Profile | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: Profile | null) => void;
  login: (user: Profile) => void;
  logout: () => void;
  setHydrated: (state: boolean) => void;
  // Profile methods (merged from profile store)
  setProfile: (p: Omit<Profile, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Profile, "id" | "createdAt" | "updatedAt">>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  clearProfile: () => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setHydrated: (state) => set({ hasHydrated: state }),
      // Profile methods (merged from profile store)
      setProfile: (p) =>
        set(() => {
          const id = p.id ?? (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
          const now = new Date().toISOString();
          const profile: Profile = {
            id,
            fullName: p.fullName,
            username: p.username,
            email: p.email ?? "",
            bio: p.bio ?? "",
            location: p.location ?? "",
            website: p.website ?? "",
            interests: p.interests ?? [],
            avatarUrl: p.avatarUrl ?? "",
            createdAt: p.createdAt ?? now,
            updatedAt: p.updatedAt ?? now,
            emailVerified: p.emailVerified ?? false,
          };
          return { user: profile, isAuthenticated: true };
        }),
      updateProfile: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch, updatedAt: new Date().toISOString() } : state.user,
        })),
      clearProfile: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(getSafeStorage),
      // Only persist non-sensitive user state; tokens stay in memory and httpOnly cookies.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

export { useAuthStore };

// Reactive selector for "is the user logged in" — used as a React Query `enabled` gate.
export function useIsAuthenticated() {
  return useAuthStore((s) => s.isAuthenticated);
}

// Clear auth state outside of React components (e.g. from the axios 401 handler).
export function clearAuthState(): void {
  useAuthStore.getState().logout();
}
