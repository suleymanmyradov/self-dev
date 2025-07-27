'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/root-layout/sidebar-nav';
import { ThemeProvider } from '@/components/theme-provider';
import { FlexibleRightSidebar } from '@/components/root-layout/flexible-right-sidebar';

const inter = Inter({ subsets: ['latin'] });

// Context for managing right sidebar content
interface RightSidebarContextType {
    isOpen: boolean;
    content: React.ReactNode | null;
    title: string;
    searchPlaceholder?: string;
    showUnreads?: boolean;
    openSidebar: (
        content: React.ReactNode,
        title: string,
        options?: {
            searchPlaceholder?: string;
            showUnreads?: boolean;
        },
    ) => void;
    closeSidebar: () => void;
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined);

export const useRightSidebar = () => {
    const context = useContext(RightSidebarContext);
    if (!context) {
        throw new Error('useRightSidebar must be used within a RightSidebarProvider');
    }
    return context;
};

function RightSidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<React.ReactNode | null>(null);
    const [title, setTitle] = useState('');
    const [searchPlaceholder, setSearchPlaceholder] = useState<string>();
    const [showUnreads, setShowUnreads] = useState<boolean>();

    const openSidebar = (
        newContent: React.ReactNode,
        newTitle: string,
        options?: {
            searchPlaceholder?: string;
            showUnreads?: boolean;
        },
    ) => {
        setContent(newContent);
        setTitle(newTitle);
        setSearchPlaceholder(options?.searchPlaceholder);
        setShowUnreads(options?.showUnreads);
        setIsOpen(true);
    };

    const closeSidebar = () => {
        setIsOpen(false);
        setContent(null);
        setTitle('');
        setSearchPlaceholder(undefined);
        setShowUnreads(undefined);
    };

    return (
        <RightSidebarContext.Provider
            value={{
                isOpen,
                content,
                title,
                searchPlaceholder,
                showUnreads,
                openSidebar,
                closeSidebar,
            }}
        >
            {children}
        </RightSidebarContext.Provider>
    );
}

export default function RootLayout({
    children,
    defaultOpen,
}: {
    children: React.ReactNode;
    defaultOpen: boolean;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <RightSidebarProvider>
                        <SidebarProvider defaultOpen={defaultOpen}>
                            <div className="flex min-h-screen w-full">
                                <SidebarNav />
                                <main className="flex flex-1 flex-col">
                                    <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
                                        <SidebarTrigger className="-ml-1" />
                                    </header>
                                    <div className="flex-1">{children}</div>
                                </main>
                                <FlexibleRightSidebar />
                            </div>
                        </SidebarProvider>
                    </RightSidebarProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
