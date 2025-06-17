import { ChatLayout } from '@/components/conversation/chat-layout';
import type React from 'react';

export default function AICoachLayout({ children }: { children: React.ReactNode }) {
    return <ChatLayout type="coach">{children}</ChatLayout>;
}
