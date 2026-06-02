import type React from 'react';
import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

import { LayoutFrame } from '@/components/layout/layout-frame';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { StoreHydrator } from '@/components/providers/store-hydrator';
import { ViewportWatcher } from '@/components/shared/viewport-watcher';
import { MobileTopBar } from '@/components/shared/mobile-topbar';
import { BottomTabBar } from '@/components/shared/bottom-tab-bar';
import { Toaster } from '@/components/ui/sonner';

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-body',
});
const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-display-face',
});
const jetbrains = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono-face',
});

export const metadata: Metadata = {
    title: 'Self Dev AI - Personal Development Assistant',
    description: 'AI-powered personal development with coaching, therapy, and habit tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${jakarta.variable} ${fraunces.variable} ${jetbrains.variable} font-sans`}
                suppressHydrationWarning
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <StoreHydrator />
                        <ViewportWatcher />
                        <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
                            <MobileTopBar />
                            <LayoutFrame>
                                {children}
                            </LayoutFrame>
                            <BottomTabBar />
                        </div>
                        <Toaster />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
