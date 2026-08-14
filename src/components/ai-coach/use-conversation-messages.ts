'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { streamPersonalizedCoaching, type CoachingProposal } from '@/api/personalization';
import { startConversation, getMessages } from '@/api/conversations';
import type { ChatAttachment } from '@/components/ai-coach/attachment-adapter';

export interface CoachingMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
    status: 'complete' | 'running';
    error?: string;
    attachments?: ChatAttachment[];
    proposals?: CoachingProposal[];
}

export interface SendMessageOptions {
    /** Text shown in the user bubble. Defaults to the streamed `text`. */
    displayText?: string;
    attachments?: ChatAttachment[];
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

    const onNew = useCallback(
        async (text: string, options?: SendMessageOptions) => {
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
                reasoning: '',
                status: 'running',
            };

            setMessages(prev => [...prev, userMsg, assistantMsg]);
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
                    userMessage: text,
                    conversationId: convId,
                },
                {
                    onThinking: message => {
                        setThinkingMessage(message);
                    },
                    onProposal: proposal => {
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId
                                    ? { ...m, proposals: [...(m.proposals ?? []), proposal] }
                                    : m,
                            ),
                        );
                    },
                    onReasoning: chunk => {
                        setThinkingMessage(null);
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId
                                    ? { ...m, reasoning: (m.reasoning ?? '') + chunk }
                                    : m,
                            ),
                        );
                    },
                    onDelta: chunk => {
                        setThinkingMessage(null);
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId ? { ...m, content: m.content + chunk } : m,
                            ),
                        );
                    },
                    onComplete: fullResponse => {
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
        abortRef.current?.abort();
        abortRef.current = null;
        setIsRunning(false);
        setThinkingMessage(null);
        setMessages(prev =>
            prev.map(m => (m.status === 'running' ? { ...m, status: 'complete' as const } : m)),
        );
    }, []);

    // Abort any in-flight stream when the component unmounts (e.g. navigating
    // away mid-stream). Without this, stream callbacks keep firing setMessages
    // / setIsRunning on an unmounted component.
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
            abortRef.current = null;
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
    };
}
