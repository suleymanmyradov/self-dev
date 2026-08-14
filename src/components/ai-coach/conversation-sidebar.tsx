'use client';

import { Component, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ThreadList } from '@/components/ai-conversation/thread-list';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { Conversation } from '@/api';

class ThreadListErrorBoundary extends Component<
    { children: ReactNode },
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

function ThreadListSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            <div className="h-14 animate-pulse rounded-lg bg-muted/70" />
            <div className="h-14 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-14 animate-pulse rounded-lg bg-muted/50" />
        </div>
    );
}

function NewChatButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
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
    activeConversationId?: string;
    onNewChat: () => void;
    onSelectConversation: (id: string) => void;
    onArchive: (id: string) => void;
    onUnarchive: (id: string) => void;
    onDelete: (id: string) => void;
    isSidebarOpen: boolean;
    onToggleSidebar: (open: boolean) => void;
    isMobileSidebarOpen: boolean;
    onMobileSidebarOpenChange: (open: boolean) => void;
    isPro: boolean;
}

type ConversationListProps = Pick<
    ConversationSidebarProps,
    | 'conversations'
    | 'isLoading'
    | 'activeConversationId'
    | 'searchQuery'
    | 'onSearchChange'
    | 'onSelectConversation'
    | 'onArchive'
    | 'onUnarchive'
    | 'onDelete'
>;

function ConversationList({
    conversations,
    isLoading,
    activeConversationId,
    searchQuery,
    onSearchChange,
    onSelectConversation,
    onArchive,
    onUnarchive,
    onDelete,
}: ConversationListProps) {
    return (
        <ThreadListErrorBoundary>
            {isLoading ? (
                <ThreadListSkeleton />
            ) : (
                <ThreadList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    onSelectConversation={onSelectConversation}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                    onDelete={onDelete}
                />
            )}
        </ThreadListErrorBoundary>
    );
}

function SidebarAccountability() {
    return (
        <div className="border-t border-border px-4 py-3">
            <p className="text-xs font-medium text-foreground">Accountability: Balanced</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your coach checks in without pushing too hard.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
                Change how the coach talks to you in{' '}
                <span className="text-foreground">Me → Coaching</span>
            </p>
        </div>
    );
}

function SidebarUpgrade({ isPro }: { isPro: boolean }) {
    if (isPro) return null;

    return (
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
    );
}

export const ConversationSidebar = ({
    conversations,
    isLoading,
    searchQuery,
    onSearchChange,
    activeConversationId,
    onNewChat,
    onSelectConversation,
    onArchive,
    onUnarchive,
    onDelete,
    isSidebarOpen,
    onToggleSidebar,
    isMobileSidebarOpen,
    onMobileSidebarOpenChange,
    isPro,
}: ConversationSidebarProps) => {
    const selectMobileConversation = (id: string) => {
        onMobileSidebarOpenChange(false);
        onSelectConversation(id);
    };

    const startMobileChat = () => {
        onMobileSidebarOpenChange(false);
        onNewChat();
    };

    return (
        <>
            {isSidebarOpen ? (
                <aside className="hidden w-[276px] shrink-0 flex-col border-r border-border bg-card md:flex">
                    <div className="flex items-center justify-between px-4 py-3">
                        <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
                        <div className="flex items-center gap-1">
                            <NewChatButton onClick={onNewChat} />
                            <TooltipIconButton
                                tooltip="Hide sidebar"
                                onClick={() => onToggleSidebar(false)}
                                className="size-6 text-muted-foreground hover:text-foreground"
                            >
                                <PanelLeftClose className="size-4" />
                            </TooltipIconButton>
                        </div>
                    </div>

                    <div className="styled-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-2">
                        <ConversationList
                            conversations={conversations}
                            isLoading={isLoading}
                            activeConversationId={activeConversationId}
                            searchQuery={searchQuery}
                            onSearchChange={onSearchChange}
                            onSelectConversation={onSelectConversation}
                            onArchive={onArchive}
                            onUnarchive={onUnarchive}
                            onDelete={onDelete}
                        />
                    </div>
                    <SidebarAccountability />
                    <SidebarUpgrade isPro={isPro} />
                </aside>
            ) : (
                <div className="hidden shrink-0 md:flex md:items-start md:pt-4">
                    <TooltipIconButton
                        tooltip="Show sidebar"
                        onClick={() => onToggleSidebar(true)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <PanelLeftOpen className="size-5" />
                    </TooltipIconButton>
                </div>
            )}

            <Sheet open={isMobileSidebarOpen} onOpenChange={onMobileSidebarOpenChange}>
                <SheetContent
                    side="left"
                    className="h-full w-[min(20rem,85vw)] max-w-none gap-0 border-r border-border bg-card p-0"
                >
                    <SheetHeader className="shrink-0 flex-row items-center justify-between border-b border-border px-4 py-3 pr-14 text-left">
                        <SheetTitle className="text-sm">Conversations</SheetTitle>
                        <NewChatButton onClick={startMobileChat} />
                        <SheetDescription className="sr-only">
                            Search and select an AI Coach conversation.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="styled-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-2">
                        <ConversationList
                            conversations={conversations}
                            isLoading={isLoading}
                            activeConversationId={activeConversationId}
                            searchQuery={searchQuery}
                            onSearchChange={onSearchChange}
                            onSelectConversation={selectMobileConversation}
                            onArchive={onArchive}
                            onUnarchive={onUnarchive}
                            onDelete={onDelete}
                        />
                    </div>
                    <SidebarAccountability />
                    <SidebarUpgrade isPro={isPro} />
                </SheetContent>
            </Sheet>
        </>
    );
};
