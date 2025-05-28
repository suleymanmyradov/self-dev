import type React from 'react';
import '@/app/globals.css';
import { Inter } from 'next/font/google';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Header } from '@/components/root-layout/header';
import { Footer } from '@/components/root-layout/footer';
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
                    <SidebarProvider>
                        <div className="flex min-h-screen min-w-screen flex-col">
                            <Header />
                            <div className="flex flex-1 mx-auto w-full ">
                                <SidebarNav />
                                <div className="flex flex-1">
                                    <main className="flex-1 min-w-0 border-r">
                                        <div className="flex items-center p-4 md:hidden">
                                            <SidebarTrigger />
                                        </div>
                                        {children}
                                    </main>
                                    <RightSidebar />
                                </div>
                            </div>
                            <Footer />
                        </div>
                    </SidebarProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
