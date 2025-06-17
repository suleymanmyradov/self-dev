'use client';

import type React from 'react';

import { useEffect } from 'react';

import { useUI } from '@/store/uiStore';
import { MobileLayout } from './mobile-layout';
import { DesktopLayout } from './desktop-layout';

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
    const { isMobile, setIsMobile } = useUI();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [setIsMobile]);

    return isMobile ? (
        <MobileLayout>{children}</MobileLayout>
    ) : (
        <DesktopLayout>{children}</DesktopLayout>
    );
}
