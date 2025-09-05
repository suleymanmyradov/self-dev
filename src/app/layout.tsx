import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UIStoreProvider } from '@/store/uiStore';
import { ResponsiveLayout } from '@/components/root-layout/responsive-layout';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Self Dev AI - Personal Development Assistant',
    description: 'AI-powered personal development with coaching, therapy, and habit tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <UIStoreProvider>
                        <ResponsiveLayout>{children}</ResponsiveLayout>
                    </UIStoreProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
