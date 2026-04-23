'use client';

import { create } from 'zustand';

interface UIState {
    isSidebarCollapsed: boolean;
    isRightPanelOpen: boolean;
    rightPanelType: 'notifications' | null;
    isMobile: boolean;
    showChatHistory: boolean;
    // Left nested panel controls
    isLeftPanelOpen: boolean;
    leftPanelType: 'notifications' | 'messages' | null;
    toggleSidebar: () => void;
    openRightPanel: (type: 'notifications') => void;
    closeRightPanel: () => void;
    setIsMobile: (mobile: boolean) => void;
    setShowChatHistory: (show: boolean) => void;
    openLeftPanel: (type: 'notifications' | 'messages') => void;
    closeLeftPanel: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

const useUIStore = create<UIState>(set => ({
    isSidebarCollapsed: true,
    isRightPanelOpen: false,
    rightPanelType: null,
    isMobile: false,
    showChatHistory: false,
    isLeftPanelOpen: false,
    leftPanelType: null,
    toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    openRightPanel: type => set({ isRightPanelOpen: true, rightPanelType: type }),
    closeRightPanel: () => set({ isRightPanelOpen: false, rightPanelType: null }),
    setIsMobile: mobile => set({ isMobile: mobile }),
    setShowChatHistory: show => set({ showChatHistory: show }),
    openLeftPanel: type =>
        set({ isLeftPanelOpen: true, leftPanelType: type }),
    closeLeftPanel: () =>
        set({ isLeftPanelOpen: false, leftPanelType: null }),
    setSidebarCollapsed: collapsed => set({ isSidebarCollapsed: collapsed }),
}));

// Hook to access UI state directly from Zustand store
export function useUI() {
    return useUIStore();
}
