'use client';

import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const conversations = [
    {
        id: '1',
        title: 'Goal Setting Strategy',
        lastMessage: "Let's work on your quarterly goals...",
        timestamp: '2 min ago',
        unread: true,
    },
    {
        id: '2',
        title: 'Daily Habit Check-in',
        lastMessage: 'How did your morning routine go?',
        timestamp: '1 hour ago',
        unread: false,
    },
    {
        id: '3',
        title: 'Career Development',
        lastMessage: 'I found some great resources...',
        timestamp: '3 hours ago',
        unread: true,
    },
    {
        id: '4',
        title: 'Wellness Planning',
        lastMessage: 'Your stress levels seem high...',
        timestamp: 'Yesterday',
        unread: false,
    },
];

export function ChatConversations() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <Button className="w-full justify-start gap-2" variant="outline">
                    <Plus className="h-4 w-4" />
                    New Conversation
                </Button>
            </div>

            <div className="flex-1 overflow-auto">
                {conversations.map(conversation => (
                    <button
                        key={conversation.id}
                        className="flex flex-col items-start gap-2 w-full text-left border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                        <div className="flex w-full items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate flex-1">
                                {conversation.title}
                            </span>
                            {conversation.unread && (
                                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1 w-full">
                            {conversation.lastMessage}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {conversation.timestamp}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
