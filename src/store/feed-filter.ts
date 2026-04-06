"use client";

import { create } from 'zustand';

export type FeedFilter = string;

interface FeedFilterState {
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
}

export const useFeedFilter = create<FeedFilterState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}));
