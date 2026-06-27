'use client';

import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Sparkles } from 'lucide-react';
import {
    AssistantRuntimeProvider,
    useExternalStoreRuntime,
    type AppendMessage,
    type ExternalStoreThreadListAdapter,
    type ThreadMessageLike,
} from '@assistant-ui/react';
import { Thread } from '@/components/ai-conversation/thread';
import { ThreadList } from '@/components/ai-conversation/thread-list';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import {
    useBillingOverview,
    useConversations,
    useArchiveConversation,
    useUnarchiveConversation,
    useDeleteConversation,
} from '@/hooks';
import { streamPersonalizedCoaching } from '@/api/personalization';
import { startConversation, getMessages } from '@/api/conversations';

interface CoachingMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status: 'complete' | 'running';
}

let messageCounter = 0;
function generateId() {
    return `msg-${++messageCounter}`;
}

function extractText(message: AppendMessage): string {
    if (typeof message.content === 'string') return message.content;
    if (Array.isArray(message.content)) {
        return message.content
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map(p => p.text)
            .join('');
    }
    return '';
}

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
            <div className="h-10 rounded-lg bg-muted/70 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/50 animate-pulse" />
        </div>
    );
}

export const Assistant = ({ conversationId }: { conversationId?: string }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState<CoachingMessage[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
        conversationId,
    );
    const abortRef = useRef<AbortController | null>(null);
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

    // Load conversation history when a conversationId is provided
    useEffect(() => {
        if (!conversationId) return;

        let cancelled = false;
        (async () => {
            try {
                const resp = await getMessages(conversationId);
                if (cancelled) return;
                const loaded: CoachingMessage[] = resp.data.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    status: 'complete',
                }));
                setMessages(loaded);
                setCurrentConversationId(conversationId);
            } catch (err) {
                console.error('Failed to load conversation:', err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [conversationId]);

    const convertMessage = useCallback((msg: CoachingMessage): ThreadMessageLike => {
        const base = {
            role: msg.role,
            content: msg.content,
            id: msg.id,
        } satisfies Omit<ThreadMessageLike, 'status'>;

        if (msg.role !== 'assistant') return base;

        return {
            ...base,
            status:
                msg.status === 'running'
                    ? { type: 'running' }
                    : { type: 'complete', reason: 'stop' },
        };
    }, []);

    const onNew = useCallback(
        async (message: AppendMessage) => {
            const userText = extractText(message);
            const userMsg: CoachingMessage = {
                id: generateId(),
                role: 'user',
                content: userText,
                status: 'complete',
            };
            const assistantId = generateId();
            const assistantMsg: CoachingMessage = {
                id: assistantId,
                role: 'assistant',
                content: '',
                status: 'running',
            };

            setMessages(prev => [...prev, userMsg, assistantMsg]);
            setIsRunning(true);

            // If we don't have a conversation yet, create one before opening the stream.
            let convId = currentConversationId;
            let createdConversationId: string | undefined;
            if (!convId) {
                try {
                    const resp = await startConversation({
                        type: 'coach',
                        title: userText,
                    });
                    convId = resp.data.id;
                    createdConversationId = convId;
                    setCurrentConversationId(convId);
                    // Refresh the sidebar thread list so the new conversation appears.
                    void queryClient.invalidateQueries({ queryKey: ['conversations'] });
                } catch (err) {
                    console.error('Failed to create conversation:', err);
                    // Continue without persistence — the stream will still work.
                }
            }

            abortRef.current = streamPersonalizedCoaching(
                {
                    userMessage: userText,
                    conversationId: convId,
                },
                {
                    onDelta: text => {
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId ? { ...m, content: m.content + text } : m,
                            ),
                        );
                    },
                    onComplete: fullResponse => {
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId
                                    ? { ...m, content: fullResponse, status: 'complete' as const }
                                    : m,
                            ),
                        );
                        setIsRunning(false);
                        abortRef.current = null;
                        // Refresh the sidebar so the conversation moves to the top
                        // (updated_at changes when the assistant message is persisted).
                        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
                        if (createdConversationId) {
                            // Update the URL silently so it reflects the conversation without
                            // triggering a Next.js route change (which would remount this
                            // component and lose the streamed messages). A refresh will land
                            // on the correct conversation page and load messages from backend.
                            window.history.replaceState(
                                null,
                                '',
                                `/ai-coach/${createdConversationId}`,
                            );
                        }
                    },
                    onError: errorMessage => {
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId
                                    ? {
                                          ...m,
                                          content:
                                              m.content ||
                                              `Sorry, I encountered an error: ${errorMessage}`,
                                          status: 'complete' as const,
                                      }
                                    : m,
                            ),
                        );
                        setIsRunning(false);
                        abortRef.current = null;
                        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
                        if (createdConversationId) {
                            window.history.replaceState(
                                null,
                                '',
                                `/ai-coach/${createdConversationId}`,
                            );
                        }
                    },
                },
            );
        },
        [currentConversationId, queryClient],
    );

    const onCancel = useCallback(async () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsRunning(false);
        setMessages(prev =>
            prev.map(m => (m.status === 'running' ? { ...m, status: 'complete' as const } : m)),
        );
    }, []);

    // Build the thread list adapter so the sidebar shows real conversations,
    // "New Chat" works, and clicking a chat navigates to it.
    const threadListAdapter = useMemo<ExternalStoreThreadListAdapter>(() => {
        const active = conversations?.filter(c => !c.archived) ?? [];
        const archived = conversations?.filter(c => c.archived) ?? [];
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
                router.push('/ai-coach');
            },
            onSwitchToThread: (threadId: string) => {
                router.push(`/ai-coach/${threadId}`);
            },
            onArchive: (threadId: string) => {
                archiveMutation.mutate(threadId);
            },
            onUnarchive: (threadId: string) => {
                unarchiveMutation.mutate(threadId);
            },
            onDelete: (threadId: string) => {
                deleteMutation.mutate(threadId);
                // If we're deleting the currently open conversation, go to /ai-coach.
                if (threadId === currentConversationId) {
                    router.push('/ai-coach');
                }
            },
        };
    }, [
        conversations,
        conversationsLoading,
        currentConversationId,
        router,
        archiveMutation,
        unarchiveMutation,
        deleteMutation,
    ]);

    const runtime = useExternalStoreRuntime<CoachingMessage>({
        messages,
        isRunning,
        convertMessage,
        onNew,
        onCancel,
        adapters: { threadList: threadListAdapter },
    });

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <div className="relative flex h-full flex-col overflow-hidden text-foreground">
                {/* Ambient calming background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-ambient-calm opacity-25 blur-3xl" />
                    <div className="absolute bottom-20 -right-20 h-64 w-64 rounded-full bg-ambient-growth opacity-20 blur-3xl" />
                </div>

                <div className="relative flex min-h-0 flex-1 gap-4 p-4 md:p-6">
                    {/* Sidebar */}
                    <aside className="card-elevated hidden w-[280px] shrink-0 overflow-hidden rounded-xl md:flex md:flex-col">
                        <div className="border-b border-border/60 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-calm-soft text-calm">
                                    <Sparkles className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-display text-xl font-bold tracking-tight">
                                        AI Coach
                                    </h2>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        Accountability sessions
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="styled-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                            <div className="mb-3 flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                <MessageCircle className="size-3.5" />
                                Sessions
                            </div>
                            <ThreadListErrorBoundary>
                                {conversationsLoading ? <ThreadListSkeleton /> : <ThreadList />}
                            </ThreadListErrorBoundary>
                            {/* Personalized AI upgrade prompt for free users */}
                            {!isPro && (
                                <div className="mt-4">
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
                        </div>
                    </aside>

                    {/* Main chat area */}
                    <main className="card-elevated relative min-w-0 flex-1 overflow-hidden rounded-xl">
                        <Thread />
                    </main>
                </div>
            </div>
        </AssistantRuntimeProvider>
    );
};
