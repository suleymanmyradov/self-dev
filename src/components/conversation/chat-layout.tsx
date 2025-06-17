'use client';

import type React from 'react';
import { ChatSidebar } from './chat-sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { useUI } from '@/store/uiStore';

interface ChatLayoutProps {
    children: React.ReactNode;
    type: 'coach' | 'therapist';
}

export function ChatLayout({ children, type }: ChatLayoutProps) {
    const { isMobile } = useUI();
    const { setOpen } = useSidebar();

    // Ensure the primary sidebar is collapsed when in chat layout
    useEffect(() => {
        if (!isMobile) {
            setOpen(false);
        }

        // Cleanup function to avoid affecting other pages
        return () => {};
    }, [setOpen, isMobile]);

    if (isMobile) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-full overflow-hidden">
            <ChatSidebar type={type} />
            <div className="flex-1 bg-background overflow-auto">{children}</div>
        </div>
    );
}
