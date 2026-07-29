import type React from 'react';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Sans, Newsreader } from 'next/font/google';
import './globals.css';

import { LayoutFrame } from '@/components/layout/layout-frame';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { StoreHydrator } from '@/components/providers/store-hydrator';
import { ViewportWatcher } from '@/components/shared/viewport-watcher';
import { MobileTopBar } from '@/components/shared/mobile-topbar';
import { BottomTabBar } from '@/components/shared/bottom-tab-bar';
import { Toaster } from '@/components/ui/sonner';
import { WebVitals } from '@/app/web-vitals';

const sans = Instrument_Sans({
    subsets: ['latin'],
    variable: '--font-body',
});
const serif = Newsreader({
    subsets: ['latin'],
    variable: '--font-display-face',
});
const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-mono-face',
});

export const metadata: Metadata = {
    title: 'Self Dev AI - Personal Development Assistant',
    description: 'AI-powered personal development with coaching, therapy, and habit tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <body
                className={`${sans.variable} ${serif.variable} ${mono.variable} font-sans`}
                suppressHydrationWarning
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <Suspense fallback={null}>
                            <StoreHydrator />
                        </Suspense>
                        <ViewportWatcher />
                        <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
                            <MobileTopBar />
                            <Suspense fallback={null}>
                                <LayoutFrame>
                                    {children}
                                </LayoutFrame>
                            </Suspense>
                            <Suspense fallback={null}>
                                <BottomTabBar />
                            </Suspense>
                        </div>
                        <WebVitals />
                        <Toaster />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
