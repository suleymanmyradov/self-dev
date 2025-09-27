'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useUI } from '@/store/uiStore';

export default function AITherapistLayout({ children }: { children: React.ReactNode }) {
    const { isMobile, setSidebarCollapsed } = useUI();

    useEffect(() => {
        if (!isMobile) {
            setSidebarCollapsed(true);
        }

        return () => {
            setSidebarCollapsed(false);
        };
    }, [isMobile, setSidebarCollapsed]);

    return <div className="h-full">{children}</div>;
}
