'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type AppendMessage, type ThreadMessageLike } from '@assistant-ui/react';
import { streamPersonalizedCoaching } from '@/api/personalization';
import { startConversation, getMessages } from '@/api/conversations';

export interface CoachingMessage {
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

    const convertMessage = useCallback((msg: CoachingMessage): ThreadMessageLike => {
        if (msg.role !== 'assistant') {
            return {
                role: msg.role,
                content: msg.content,
                id: msg.id,
            };
        }

        // When the assistant is running and has no streamed content yet,
        // show the latest thinking message so the user sees the coach is
        // processing (e.g. "Looking up your goals...") instead of a blank
        // bubble. Once the first delta arrives, thinkingMessage is cleared
        // and msg.content takes over.
        const content =
            msg.status === 'running' && !msg.content && thinkingMessage
                ? thinkingMessage
                : msg.content;

        return {
            role: msg.role,
            content,
            id: msg.id,
            status:
                msg.status === 'running'
                    ? { type: 'running' }
                    : { type: 'complete', reason: 'stop' },
        };
    }, [thinkingMessage]);

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
            setThinkingMessage(null);

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
                    onThinking: message => {
                        setThinkingMessage(message);
                    },
                    onDelta: text => {
                        setThinkingMessage(null);
                        setMessages(prev =>
                            prev.map(m =>
                                m.id === assistantId ? { ...m, content: m.content + text } : m,
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
    // / setIsRunning on an unmounted component, which races with assistant-ui's
    // internal fiber cleanup and surfaces as "Tried to unmount a fiber that is
    // already unmounted".
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
        currentConversationId,
        setCurrentConversationId,
        convertMessage,
        onNew,
        onCancel,
    };
}
