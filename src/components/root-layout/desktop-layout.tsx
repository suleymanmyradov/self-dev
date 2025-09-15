'use client';

import type React from 'react';
import { SearchHeader } from './header';
import { PrimarySidebar } from './sidebar-nav';
import { NotificationDrawer } from './notification-drawer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export function DesktopLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <PrimarySidebar />

                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                    <SearchHeader />
                    <main className="flex-1 overflow-auto">{children}</main>
                    <NotificationDrawer />
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
