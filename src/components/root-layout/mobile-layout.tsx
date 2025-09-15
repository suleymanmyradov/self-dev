'use client';

import type React from 'react';
import { BottomTabBar } from './bottom-tab-bar';
import { NotificationModal } from './notification-modal';

export function MobileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <div className="flex-1 overflow-auto">{children}</div>
            <BottomTabBar />
            <NotificationModal />
        </div>
    );
}
