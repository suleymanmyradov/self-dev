import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'AI Coach | Growth',
  description: 'Your AI accountability coach — set goals, build habits, and check in daily.',
};

export default function AICoachLayout({ children }: { children: React.ReactNode }) {
    return <div className="h-full">{children}</div>;
}
