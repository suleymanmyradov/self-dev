'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '@/lib/safe-storage';

interface UIState {
    isSidebarCollapsed: boolean;
    isRightPanelOpen: boolean;
    rightPanelType: 'notifications' | null;
    isMobile: boolean;
    showChatHistory: boolean;
    // Left nested panel controls
    isLeftPanelOpen: boolean;
    leftPanelType: 'notifications' | 'messages' | null;
    // Check-in modal controls
    checkInModalOpen: boolean;
    checkInHabitId: string | null;
    // Appearance
    secondaryColor: string;
    toggleSidebar: () => void;
    openRightPanel: (type: 'notifications') => void;
    closeRightPanel: () => void;
    setIsMobile: (mobile: boolean) => void;
    setShowChatHistory: (show: boolean) => void;
    openLeftPanel: (type: 'notifications' | 'messages') => void;
    closeLeftPanel: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    openCheckInModal: (habitId: string) => void;
    closeCheckInModal: () => void;
    setSecondaryColor: (color: string) => void;
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: true,
      isRightPanelOpen: false,
      rightPanelType: null,
      isMobile: false,
      showChatHistory: false,
      isLeftPanelOpen: false,
      leftPanelType: null,
      checkInModalOpen: false,
      checkInHabitId: null,
      secondaryColor: 'gray',
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      openRightPanel: (type) => set({ isRightPanelOpen: true, rightPanelType: type }),
      closeRightPanel: () => set({ isRightPanelOpen: false, rightPanelType: null }),
      setIsMobile: (mobile) => set({ isMobile: mobile }),
      setShowChatHistory: (show) => set({ showChatHistory: show }),
      openLeftPanel: (type) =>
        set({ isLeftPanelOpen: true, leftPanelType: type }),
      closeLeftPanel: () =>
        set({ isLeftPanelOpen: false, leftPanelType: null }),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      openCheckInModal: (habitId) => set({ checkInModalOpen: true, checkInHabitId: habitId }),
      closeCheckInModal: () => set({ checkInModalOpen: false, checkInHabitId: null }),
      setSecondaryColor: (color) => set({ secondaryColor: color }),
    }),
    {
      name: 'ui-appearance',
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        secondaryColor: state.secondaryColor,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);

export { useUIStore };

// Prefer using `useUIStore` with atomic selectors to avoid re-renders:
//   const isLeftPanelOpen = useUIStore(s => s.isLeftPanelOpen)
//   const closeLeftPanel = useUIStore(s => s.closeLeftPanel)
