'use client'

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '@/lib/safe-storage';
import type { Profile } from '@/api';

// Cookie helpers — sync access token to a cookie so Next.js middleware can read it
const AUTH_COOKIE_NAME = 'auth-token';

function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return;
  // SameSite=Lax, path=/, 7-day expiry
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function removeAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

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
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) => {
        setAuthCookie(accessToken);
        set({ accessToken, refreshToken });
      },
      login: (user, accessToken, refreshToken) => {
        setAuthCookie(accessToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        removeAuthCookie();
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
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          Promise.resolve().then(() => {
            state.setHydrated(true);
          });
        } else if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Hook to access auth state - use directly without Context wrapper
export function useAuth() {
  return useAuthStore();
}

// Hook to get access token for API client
export function useAccessToken() {
  return useAuth().accessToken;
}

// Get access token outside of React components
export function getAccessTokenFromStore(): string | null {
  return useAuthStore.getState().accessToken;
}

// Get refresh token outside of React components
export function getRefreshTokenFromStore(): string | null {
  return useAuthStore.getState().refreshToken;
}

// Set tokens outside of React components (for API client)
export function setTokensInStore(accessToken: string, refreshToken: string): void {
  useAuthStore.getState().setTokens(accessToken, refreshToken);
}

// Clear auth state outside of React components
export function clearAuthState(): void {
  useAuthStore.getState().logout();
}

// Convenience hook for profile access (replaces useProfile from profile.tsx)
export function useProfile() {
  const { user, hasHydrated, setProfile, updateProfile, clearProfile } = useAuth();
  return {
    profile: user,
    hasHydrated,
    setProfile,
    updateProfile,
    clearProfile,
  };
}
