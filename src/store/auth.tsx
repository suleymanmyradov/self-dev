'use client'

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '@/lib/safe-storage';
import { setAuthTokens, clearTokens } from '@/lib/auth-tokens';
import type { Profile } from '@/api';

export type AuthState = {
  user: Profile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: Profile | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: Profile, accessToken: string, refreshToken: string) => void;
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
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) => {
        setAuthTokens(accessToken, refreshToken);
        set({ accessToken, refreshToken });
      },
      login: (user, accessToken, refreshToken) => {
        setAuthTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
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

// Hook to get access token for API client
export function useAccessToken() {
  return useAuthStore(s => s.accessToken);
}

// Set tokens outside of React components (for API client) — delegates to the standalone module
export function setTokensInStore(accessToken: string, refreshToken: string): void {
  setAuthTokens(accessToken, refreshToken);
  useAuthStore.getState().setTokens(accessToken, refreshToken);
}

// Clear auth state outside of React components — delegates to the standalone module
export function clearAuthState(): void {
  clearTokens();
  useAuthStore.getState().logout();
}
