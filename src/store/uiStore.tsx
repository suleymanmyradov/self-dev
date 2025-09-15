'use client';

import { create } from 'zustand';
import { createContext, useContext, type ReactNode } from 'react';

interface UIState {
    isSidebarCollapsed: boolean;
    isRightPanelOpen: boolean;
    rightPanelType: 'notifications' | null;
    isMobile: boolean;
    showChatHistory: boolean;
    toggleSidebar: () => void;
    openRightPanel: (type: 'notifications') => void;
    closeRightPanel: () => void;
    setIsMobile: (mobile: boolean) => void;
    setShowChatHistory: (show: boolean) => void;
}

const useUIStore = create<UIState>(set => ({
    isSidebarCollapsed: false,
    isRightPanelOpen: false,
    rightPanelType: null,
    isMobile: false,
    showChatHistory: false,
    toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    openRightPanel: type => set({ isRightPanelOpen: true, rightPanelType: type }),
    closeRightPanel: () => set({ isRightPanelOpen: false, rightPanelType: null }),
    setIsMobile: mobile => set({ isMobile: mobile }),
    setShowChatHistory: show => set({ showChatHistory: show }),
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
