'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle } from 'lucide-react';
import { mockConversations } from '@/lib/mock-data';

interface ChatSidebarProps {
    type: 'coach' | 'therapist';
}

export function ChatSidebar({ type }: ChatSidebarProps) {
    const pathname = usePathname();
    const conversations = mockConversations.filter(conv => conv.type === type);

    return (
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {type === 'coach' ? 'AI Coach' : 'AI Therapist'}
                </h2>
                <Button className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {conversations.map(conversation => {
                        const isActive = pathname.includes(conversation.id);

                        return (
                            <Link
                                key={conversation.id}
                                href={`/${type === 'coach' ? 'ai-coach' : 'ai-therapist'}/${conversation.id}`}
                                className={cn(
                                    'block p-3 rounded-lg text-sm transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-50',
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">
                                            {conversation.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {conversation.lastMessage}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {conversation.timestamp.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
