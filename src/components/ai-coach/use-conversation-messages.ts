'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { streamPersonalizedCoaching, type CoachingProposal } from '@/api/personalization';
import { startConversation, getMessages } from '@/api/conversations';
import type { StreamAttachment } from '@/api/types';
import {
    prepareAttachmentForApi,
    type ChatAttachment,
} from '@/components/ai-coach/attachment-adapter';

export interface CoachingMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status: 'complete' | 'running';
    error?: string;
    attachments?: ChatAttachment[];
    proposals?: CoachingProposal[];
}

export interface SendMessageOptions {
    /** Text shown in the user bubble. Defaults to the streamed `text`. */
    displayText?: string;
    goalId?: string;
    attachments?: ChatAttachment[];
    regenerateMessageId?: string;
}

let messageCounter = 0;
function generateId() {
    return `msg-${++messageCounter}`;
}

export function useConversationMessages(conversationId?: string) {
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState<CoachingMessage[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
    const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
        conversationId,
    );
    const abortRef = useRef<AbortController | null>(null);
    const stateVersionRef = useRef(0);

    // Load conversation history when a conversationId is provided
    useEffect(() => {
        if (!conversationId) return;

        const loadVersion = ++stateVersionRef.current;
        let cancelled = false;
        (async () => {
            try {
                const resp = await getMessages(conversationId);
                if (cancelled || loadVersion !== stateVersionRef.current) return;
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

    const onNew = useCallback(
        async (text: string, options?: SendMessageOptions) => {
            const requestVersion = ++stateVersionRef.current;
            const userText = options?.displayText ?? text;
            const userMsg: CoachingMessage = {
                id: generateId(),
                role: 'user',
                content: userText,
                status: 'complete',
                attachments: options?.attachments,
            };
            const assistantId = generateId();
            const assistantMsg: CoachingMessage = {
                id: assistantId,
                role: 'assistant',
                content: '',
                status: 'running',
            };

            setMessages(prev => {
                if (!options?.regenerateMessageId) return [...prev, userMsg, assistantMsg];
                const assistantIndex = prev.findIndex(
                    message => message.id === options.regenerateMessageId,
                );
                if (assistantIndex < 0) return prev;
                return [...prev.slice(0, assistantIndex), assistantMsg];
            });
            setIsRunning(true);
            setThinkingMessage(null);

            // If we don't have a conversation yet, create one before opening the stream.
            let convId = currentConversationId;
            let createdConversationId: string | undefined;
            if (!convId) {
                try {
                    const resp = await startConversation({
                        type: 'coach',
                        title: userText || text,
                    });
                    if (requestVersion !== stateVersionRef.current) return;
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

            if (requestVersion !== stateVersionRef.current) return;

            const apiAttachments: StreamAttachment[] | undefined =
                options?.attachments && options.attachments.length > 0
                    ? (await Promise.all(options.attachments.map(prepareAttachmentForApi))).filter(
                          (a): a is StreamAttachment => a !== null,
                      )
                    : undefined;

            if (requestVersion !== stateVersionRef.current) return;

            abortRef.current = streamPersonalizedCoaching(
                {
                    userMessage: text,
                    conversationId: convId,
                    attachments: apiAttachments,
                    ...(options?.goalId ? { goalId: options.goalId } : {}),
                    ...(options?.regenerateMessageId ? { regenerate: true } : {}),
                },
                {
                    onThinking: message => {
                        if (requestVersion !== stateVersionRef.current) return;
                        setThinkingMessage(message);
                    },
                    onProposal: proposal => {
                        if (requestVersion !== stateVersionRef.current) return;
                        setMessages(prev =>
                            prev.map(m => {
                                if (m.id !== assistantId) return m;
                                const proposals = m.proposals ?? [];
                                const existingIndex = proposals.findIndex(
                                    item => item.id === proposal.id,
                                );
                                if (existingIndex < 0) {
                                    return { ...m, proposals: [...proposals, proposal] };
                                }
                                return {
                                    ...m,
                                    proposals: proposals.map((item, index) =>
                                        index === existingIndex ? proposal : item,
                                    ),
                                };
                            }),
                        );
                    },
                    onReasoning: () => {
                        if (requestVersion !== stateVersionRef.current) return;
                        setThinkingMessage(null);
                    },
                    onDelta: chunk => {
                        if (requestVersion !== stateVersionRef.current) return;
                        setThinkingMessage(null);
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId ? { ...m, content: m.content + chunk } : m,
                            ),
                        );
                    },
                    onComplete: fullResponse => {
                        if (requestVersion !== stateVersionRef.current) return;
                        setThinkingMessage(null);
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
                                `/coach/${createdConversationId}`,
                            );
                        }
                    },
                    onError: errorMessage => {
                        if (requestVersion !== stateVersionRef.current) return;
                        setThinkingMessage(null);
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId
                                    ? {
                                          ...m,
                                          error: errorMessage,
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
                                `/coach/${createdConversationId}`,
                            );
                        }
                    },
                },
            );
        },
        [currentConversationId, queryClient],
    );

    const onCancel = useCallback(async () => {
        stateVersionRef.current++;
        abortRef.current?.abort();
        abortRef.current = null;
        setIsRunning(false);
        setThinkingMessage(null);
        setMessages(prev =>
            prev.map(m => (m.status === 'running' ? { ...m, status: 'complete' as const } : m)),
        );
    }, []);

    const onReset = useCallback(() => {
        stateVersionRef.current++;
        abortRef.current?.abort();
        abortRef.current = null;
        setMessages([]);
        setIsRunning(false);
        setThinkingMessage(null);
        setCurrentConversationId(undefined);
    }, []);

    // Abort any in-flight stream when the component unmounts (e.g. navigating
    // away mid-stream). Without this, stream callbacks keep firing setMessages
    // / setIsRunning on an unmounted component.
    useEffect(() => {
        const stateVersion = stateVersionRef;
        const abortController = abortRef;
        return () => {
            stateVersion.current++;
            abortController.current?.abort();
            abortController.current = null;
        };
    }, []);

    return {
        messages,
        setMessages,
        isRunning,
        thinkingMessage,
        currentConversationId,
        setCurrentConversationId,
        onNew,
        onCancel,
        onReset,
    };
}
