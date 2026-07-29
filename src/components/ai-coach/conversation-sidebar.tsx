'use client';

import { Component } from 'react';
import { useRouter } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ThreadList } from '@/components/ai-conversation/thread-list';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import type { Conversation } from '@/api';

/**
 * Lightweight error boundary so a failure in the thread list sidebar (e.g. a
 * fetch error thrown during render) doesn't take down the whole chat area.
 */
class ThreadListErrorBoundary extends Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error('ThreadList error:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <p className="px-2 py-3 text-xs text-muted-foreground">
                    Couldn&apos;t load conversations.
                </p>
            );
        }
        return this.props.children;
    }
}

/** Skeleton shown while the conversation list is loading. */
function ThreadListSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            <div className="h-14 rounded-lg bg-muted/70 animate-pulse" />
            <div className="h-14 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-14 rounded-lg bg-muted/50 animate-pulse" />
        </div>
    );
}

/**
 * New chat button — 24px square, bg-foreground text-background, "+" icon.
 * Uses ThreadListPrimitive.New from assistant-ui to handle the new-thread logic.
 */
function ThreadListPrimitiveNewChat() {
    // We can't use ThreadListPrimitive.New here because it's inside the
    // ThreadList component. Instead, navigate to /coach directly.
    const router = useRouter();
    return (
        <button
            onClick={() => router.push('/coach')}
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background transition-[background-color] hover:bg-foreground/90"
            aria-label="New chat"
        >
            <span className="text-sm leading-none">+</span>
        </button>
    );
}

interface ConversationSidebarProps {
    conversations: Conversation[] | undefined;
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isSidebarOpen: boolean;
    onToggleSidebar: (open: boolean) => void;
    isPro: boolean;
}

export const ConversationSidebar = ({
    conversations,
    isLoading,
    searchQuery,
    onSearchChange,
    isSidebarOpen,
    onToggleSidebar,
    isPro,
}: ConversationSidebarProps) => {
    if (isSidebarOpen) {
        return (
            <aside className="hidden w-[276px] shrink-0 flex-col border-r border-border bg-card md:flex">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
                    <div className="flex items-center gap-1">
                        <ThreadListPrimitiveNewChat />
                        <TooltipIconButton
                            tooltip="Hide sidebar"
                            onClick={() => onToggleSidebar(false)}
                            className="size-6 text-muted-foreground hover:text-foreground"
                        >
                            <PanelLeftClose className="size-4" />
                        </TooltipIconButton>
                    </div>
                </div>

                {/* Thread list */}
                <div className="styled-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-2">
                    <ThreadListErrorBoundary>
                        {isLoading ? (
                            <ThreadListSkeleton />
                        ) : (
                            <ThreadList
                                conversations={conversations}
                                searchQuery={searchQuery}
                                onSearchChange={onSearchChange}
                            />
                        )}
                    </ThreadListErrorBoundary>
                </div>

                {/* Accountability card at bottom */}
                <div className="border-t border-border px-4 py-3">
                    <p className="text-xs font-medium text-foreground">
                        Accountability: Balanced
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Your coach checks in without pushing too hard.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Change how the coach talks to you in{' '}
                        <span className="text-foreground">Me → Coaching</span>
                    </p>
                </div>

                {/* Upgrade prompt for non-Pro users */}
                {!isPro && (
                    <div className="border-t border-border p-3">
                        <UpgradePrompt
                            surface="assistant_personalization"
                            trigger="personalized_ai"
                            title="Deeper coaching memory"
                            description="Upgrade to Pro for personalized AI coaching that remembers your patterns."
                            compact
                            isPro={isPro}
                        />
                    </div>
                )}
            </aside>
        );
    }

    return (
        <div className="hidden shrink-0 md:flex md:items-start md:pt-4">
            <TooltipIconButton
                tooltip="Show sidebar"
                onClick={() => onToggleSidebar(true)}
                className="text-muted-foreground hover:text-foreground"
            >
                <PanelLeftOpen className="size-5" />
            </TooltipIconButton>
        </div>
    );
};
