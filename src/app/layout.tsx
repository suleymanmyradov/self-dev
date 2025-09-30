import type React from 'react';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { LayoutFrame } from '@/components/root-layout/layout-frame';
import { ThemeProvider } from '@/components/theme-provider';
import { UIStoreProvider } from '@/store/uiStore';
import { ViewportWatcher } from '@/components/shared/viewport-watcher';
import { MobileTopBar } from '@/components/shared/mobile-topbar';
import { BottomTabBar } from '@/components/shared/bottom-tab-bar';
import Loading from './loading';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Self Dev AI - Personal Development Assistant',
    description: 'AI-powered personal development with coaching, therapy, and habit tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <UIStoreProvider>
                        <ViewportWatcher />
                        <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
                            <MobileTopBar />
                            <LayoutFrame>
                                <Suspense fallback={<Loading />}>
                                    {children}
                                </Suspense>
                            </LayoutFrame>
                            <BottomTabBar />
                        </div>
                    </UIStoreProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
