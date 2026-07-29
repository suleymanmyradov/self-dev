'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    AssistantRuntimeProvider,
    useExternalStoreRuntime,
    type ExternalStoreThreadListAdapter,
} from '@assistant-ui/react';
import { Thread } from '@/components/ai-conversation/thread';
import { VoiceMode } from '@/components/ai-coach/voice-mode';
import { ConversationSidebar } from '@/components/ai-coach/conversation-sidebar';
import { ConversationHeader } from '@/components/ai-coach/conversation-header';
import { useConversationMessages } from '@/components/ai-coach/use-conversation-messages';
import {
    useBillingOverview,
    useConversations,
    useArchiveConversation,
    useUnarchiveConversation,
    useDeleteConversation,
} from '@/hooks';
import { getMessages } from '@/api/conversations';

export const Assistant = ({ conversationId }: { conversationId?: string }) => {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { data: billing } = useBillingOverview();
    const isPro = billing?.subscription?.planCode === 'pro';

    // Fetch the list of coach conversations for the sidebar thread list.
    const { data: conversations, isLoading: conversationsLoading } = useConversations({
        page: 1,
        limit: 50,
        type: 'coach',
    });
    const archiveMutation = useArchiveConversation();
    const unarchiveMutation = useUnarchiveConversation();
    const deleteMutation = useDeleteConversation();

    const {
        messages,
        setMessages,
        isRunning,
        currentConversationId,
        setCurrentConversationId,
        convertMessage,
        onNew,
        onCancel,
    } = useConversationMessages(conversationId);

    // Filter conversations by search query
    const filteredConversations = useMemo(() => {
        const all = conversations ?? [];
        const q = searchQuery.trim().toLowerCase();
        if (!q) return all;
        return all.filter(
            c =>
                c.title?.toLowerCase().includes(q) ||
                c.lastMessage?.toLowerCase().includes(q),
        );
    }, [conversations, searchQuery]);

    // Find the active conversation for the header bar
    const activeConversation = useMemo(() => {
        if (!currentConversationId) return undefined;
        return conversations?.find(c => c.id === currentConversationId);
    }, [conversations, currentConversationId]);

    // Build the thread list adapter so the sidebar shows real conversations,
    // "New Chat" works, and clicking a chat navigates to it.
    const threadListAdapter = useMemo<ExternalStoreThreadListAdapter>(() => {
        const active = filteredConversations.filter(c => !c.archived);
        const archived = filteredConversations.filter(c => c.archived);
        return {
            threadId: currentConversationId,
            isLoading: conversationsLoading,
            threads: active.map(c => ({
                id: c.id,
                title: c.title || 'New Chat',
                status: 'regular' as const,
            })),
            archivedThreads: archived.map(c => ({
                id: c.id,
                title: c.title || 'New Chat',
                status: 'archived' as const,
            })),
            onSwitchToNewThread: () => {
                router.push('/coach');
            },
            onSwitchToThread: (threadId: string) => {
                router.push(`/coach/${threadId}`);
            },
            onArchive: (threadId: string) => {
                archiveMutation.mutate(threadId);
            },
            onUnarchive: (threadId: string) => {
                unarchiveMutation.mutate(threadId);
            },
            onDelete: (threadId: string) => {
                deleteMutation.mutate(threadId);
                // If we're deleting the currently open conversation, go to /coach.
                if (threadId === currentConversationId) {
                    router.push('/coach');
                }
            },
        };
    }, [
        filteredConversations,
        conversationsLoading,
        currentConversationId,
        router,
        archiveMutation,
        unarchiveMutation,
        deleteMutation,
    ]);

    const runtime = useExternalStoreRuntime({
        messages,
        isRunning,
        convertMessage,
        onNew,
        onCancel,
        adapters: { threadList: threadListAdapter },
    });

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <div className="relative flex h-full overflow-hidden bg-background text-foreground">
                {/* Sidebar — 276px, white bg, border-right */}
                <ConversationSidebar
                    conversations={filteredConversations}
                    isLoading={conversationsLoading}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={setIsSidebarOpen}
                    isPro={isPro}
                />

                {/* Main chat area */}
                <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
                    {/* Header bar */}
                    <ConversationHeader
                        title={activeConversation?.title}
                        onVoiceMode={() => setIsVoiceMode(true)}
                    />

                    {/* Conversation thread */}
                    <Thread />
                </main>
            </div>

            {/* Full-screen live voice chat overlay. */}
            {isVoiceMode && (
                <VoiceMode
                    conversationId={currentConversationId}
                    onConversationCreated={id => {
                        setCurrentConversationId(id);
                        // Reload messages from the backend so the text thread
                        // reflects the voice conversation when voice mode closes.
                        void (async () => {
                            try {
                                const resp = await getMessages(id);
                                const loaded = resp.data.map(m => ({
                                    id: m.id,
                                    role: m.role,
                                    content: m.content,
                                    status: 'complete' as const,
                                }));
                                setMessages(loaded);
                            } catch {
                                // Non-fatal — the sidebar will still refresh.
                            }
                        })();
                    }}
                    onClose={() => setIsVoiceMode(false)}
                />
            )}
        </AssistantRuntimeProvider>
    );
};
