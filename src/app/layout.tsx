import type React from 'react';
import '@/app/globals.css';
import { Inter } from 'next/font/google';

import { SidebarNav } from '@/components/root-layout/sidebar-nav';
import { ThemeProvider } from '@/components/theme-provider';
import { RightSidebar } from '@/components/root-layout/right-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Growth - Self-Development Platform',
    description: 'A platform for personal growth and self-development',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="flex min-h-screen w-full flex-col">
                        <div className="w-full flex-1 min-h-0 overflow-hidden md:pl-56 lg:pr-80">
                            {/* Fixed Left Sidebar */}
                            <aside className="fixed left-0 top-0 z-30 hidden h-screen w-56 md:block">
                                <SidebarNav />
                            </aside>

                            {/* Fixed Right Sidebar */}
                            <aside className="fixed right-0 top-0 z-30 hidden h-screen w-80 lg:block">
                                <RightSidebar />
                            </aside>

                            {/* Main Content (page will manage its own scrolling) */}
                            <main className="min-w-0 h-screen overflow-hidden">
                                {children}
                            </main>
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
