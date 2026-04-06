import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'AI Coach | Growth',
  description: 'Get personalized coaching from our AI assistant.',
};

export default function AICoachLayout({ children }: { children: React.ReactNode }) {
    return <div className="h-full">{children}</div>;
}
