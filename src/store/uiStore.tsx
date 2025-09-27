'use client';

import { create } from 'zustand';
import { createContext, useContext, type ReactNode } from 'react';

interface UIState {
    isSidebarCollapsed: boolean;
    isRightPanelOpen: boolean;
    rightPanelType: 'notifications' | null;
    isMobile: boolean;
    showChatHistory: boolean;
    // Left nested panel controls
    isLeftPanelOpen: boolean;
    leftPanelType: 'search' | 'notifications' | 'messages' | null;
    toggleSidebar: () => void;
    openRightPanel: (type: 'notifications') => void;
    closeRightPanel: () => void;
    setIsMobile: (mobile: boolean) => void;
    setShowChatHistory: (show: boolean) => void;
    openLeftPanel: (type: 'search' | 'notifications' | 'messages') => void;
    closeLeftPanel: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

const useUIStore = create<UIState>(set => ({
    isSidebarCollapsed: false,
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
        set({ isLeftPanelOpen: true, leftPanelType: type, isSidebarCollapsed: true }),
    closeLeftPanel: () =>
        set({ isLeftPanelOpen: false, leftPanelType: null, isSidebarCollapsed: false }),
    setSidebarCollapsed: collapsed => set({ isSidebarCollapsed: collapsed }),
}));

const UIStoreContext = createContext<typeof useUIStore | null>(null);

export function UIStoreProvider({ children }: { children: ReactNode }) {
    return <UIStoreContext.Provider value={useUIStore}>{children}</UIStoreContext.Provider>;
}

export function useUI() {
    const store = useContext(UIStoreContext);
    if (!store) {
        throw new Error('useUI must be used within UIStoreProvider');
    }
    return store();
}
