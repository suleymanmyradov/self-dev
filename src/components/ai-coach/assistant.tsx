'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Thread } from '@/components/ai-conversation/thread';
import { ChatProvider } from '@/components/ai-conversation/chat-context';
import { VoiceMode } from '@/components/ai-coach/voice-mode';
import { ConversationSidebar } from '@/components/ai-coach/conversation-sidebar';
import { ConversationHeader } from '@/components/ai-coach/conversation-header';
import { useConversationMessages } from '@/components/ai-coach/use-conversation-messages';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    useBillingOverview,
    useConversations,
    useArchiveConversation,
    useUnarchiveConversation,
    useDeleteConversation,
} from '@/hooks';
import { getMessages } from '@/api/conversations';

export const Assistant = ({
    conversationId,
    initialGoalId,
    initialGoalTitle,
}: {
    conversationId?: string;
    initialGoalId?: string;
    initialGoalTitle?: string;
}) => {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const { data: billing } = useBillingOverview();
    const isPro = billing?.subscription?.planCode === 'pro';

    const { data: conversations, isLoading: conversationsLoading } = useConversations({
        page: 1,
        limit: 50,
        type: 'coach',
    });
    const archiveMutation = useArchiveConversation();
    const unarchiveMutation = useUnarchiveConversation();
    const deleteMutation = useDeleteConversation();
    const conversationState = useConversationMessages(conversationId);
    const { setMessages, currentConversationId, setCurrentConversationId, onNew, onReset } =
        conversationState;
    const initialGoalStartedRef = useRef(false);

    useEffect(() => {
        if (conversationId || !initialGoalId || initialGoalStartedRef.current) return;
        initialGoalStartedRef.current = true;
        const goalTitle = initialGoalTitle?.trim() || 'this goal';
        void onNew(
            `Analyze my progress for goal "${goalTitle}" (Goal ID: ${initialGoalId}). Review its linked habits and recent check-in notes, identify patterns, and suggest the most useful next step.`,
            {
                displayText: `Analyze my progress for ${goalTitle}`,
                goalId: initialGoalId,
            },
        );
    }, [conversationId, initialGoalId, initialGoalTitle, onNew]);

    const filteredConversations = useMemo(() => {
        const all = conversations ?? [];
        const query = searchQuery.trim().toLowerCase();
        if (!query) return all;
        return all.filter(
            conversation =>
                conversation.title?.toLowerCase().includes(query) ||
                conversation.lastMessage?.toLowerCase().includes(query),
        );
    }, [conversations, searchQuery]);

    const activeConversation = useMemo(() => {
        if (!currentConversationId) return undefined;
        return conversations?.find(conversation => conversation.id === currentConversationId);
    }, [conversations, currentConversationId]);

    const handleDelete = (id: string) => {
        setDeleteTargetId(id);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        const id = deleteTargetId;
        try {
            await deleteMutation.mutateAsync(id);
            if (id === currentConversationId) {
                router.push('/coach');
            }
            setDeleteTargetId(null);
        } catch {
            // Keep the dialog open and let the mutation's error handling surface the issue.
        }
    };

    return (
        <ChatProvider key={conversationId ?? 'new'} state={conversationState}>
            <div className="relative flex h-full overflow-hidden bg-background text-foreground">
                <ConversationSidebar
                    conversations={filteredConversations}
                    isLoading={conversationsLoading}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeConversationId={currentConversationId}
                    onNewChat={() => {
                        onReset();
                        router.push('/coach');
                    }}
                    onSelectConversation={id => router.push(`/coach/${id}`)}
                    onArchive={id => archiveMutation.mutate(id)}
                    onUnarchive={id => unarchiveMutation.mutate(id)}
                    onDelete={handleDelete}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={setIsSidebarOpen}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    onMobileSidebarOpenChange={setIsMobileSidebarOpen}
                    isPro={isPro}
                />

                <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <ConversationHeader
                        title={activeConversation?.title}
                        onOpenConversations={() => setIsMobileSidebarOpen(true)}
                        onVoiceMode={() => setIsVoiceMode(true)}
                        conversationId={currentConversationId}
                        isArchived={activeConversation?.archived}
                        onArchive={id => archiveMutation.mutate(id)}
                        onUnarchive={id => unarchiveMutation.mutate(id)}
                        onDelete={handleDelete}
                    />
                    <Thread />
                </main>
            </div>

            {isVoiceMode && (
                <VoiceMode
                    conversationId={currentConversationId}
                    onConversationCreated={id => {
                        setCurrentConversationId(id);
                        void (async () => {
                            try {
                                const response = await getMessages(id);
                                const loaded = response.data.map(message => ({
                                    id: message.id,
                                    role: message.role,
                                    content: message.content,
                                    status: 'complete' as const,
                                }));
                                setMessages(loaded);
                            } catch {
                                // The sidebar still refreshes if the text history cannot load.
                            }
                        })();
                    }}
                    onClose={() => setIsVoiceMode(false)}
                />
            )}

            <Dialog
                open={deleteTargetId !== null}
                onOpenChange={open => {
                    if (!open) setDeleteTargetId(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete conversation?</DialogTitle>
                        <DialogDescription>
                            This permanently removes the conversation and all its messages. This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTargetId(null)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ChatProvider>
    );
};
