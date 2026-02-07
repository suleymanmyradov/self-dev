"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Profile } from "@/lib/types-data";
import { getSafeStorage } from "@/lib/safe-storage";

export type ProfileState = {
  profile: Profile | null;
  hasHydrated: boolean;
  setProfile: (p: Omit<Profile, "id"> & Partial<Pick<Profile, "id">>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  clearProfile: () => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      hasHydrated: false,
      setProfile: (p) =>
        set(() => {
          const id = p.id ?? (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
          return { profile: { id, fullName: p.fullName, username: p.username, email: p.email ?? "", bio: p.bio ?? "", location: p.location ?? "", website: p.website ?? "", interests: p.interests ?? [], avatarUrl: p.avatarUrl ?? "" } };
        }),
      updateProfile: (patch) =>
        set((state) => ({ profile: state.profile ? { ...state.profile, ...patch } : state.profile })),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "profile",
      storage: createJSONStorage(getSafeStorage),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          Promise.resolve().then(() => {
            useProfile.setState({ hasHydrated: true });
          });
        } else {
          useProfile.setState({ hasHydrated: true });
        }
      },
    },
  ),
);
