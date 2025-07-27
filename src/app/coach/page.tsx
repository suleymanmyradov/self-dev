'use client';

import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useRightSidebar } from '@/app/layout';
import { ChatConversations } from '@/components/sidebar-content/chat-conversation';

export default function CoachPage() {
    const { openSidebar } = useRightSidebar();

    // Automatically open the sidebar when this page loads
    useEffect(() => {
        openSidebar(<ChatConversations />, 'AI Coach Conversations', {
            searchPlaceholder: 'Search conversations...',
        });
    }, []);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            {/* Chat Header */}
            <div className="border-b p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="/ai-coach.png" alt="AI Coach" />
                        <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-lg font-semibold">AI Personal Growth Coach</h1>
                        <p className="text-sm text-muted-foreground">
                            Always here to help you grow
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-auto">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/ai-coach.png" alt="AI Coach" />
                            <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3 max-w-sm">
                            <p className="text-sm">
                                Hello! Im your personal growth coach. How can I help you today? Are
                                you looking to work on habits, set new goals, or discuss any
                                challenges?
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 justify-end">
                        <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-sm">
                            <p className="text-sm">
                                I want to build better morning routines. I keep hitting snooze and
                                starting my day late.
                            </p>
                        </div>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/ai-coach.png" alt="AI Coach" />
                            <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3 max-w-sm">
                            <p className="text-sm">
                                Great goal! Lets start with small, manageable changes. What time do
                                you currently wake up, and what time would you ideally like to wake
                                up?
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
