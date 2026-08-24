'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Loader2Icon } from 'lucide-react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

import { useChatThread } from '@/components/ai-conversation/chat-context';
import { Composer } from '@/components/ai-conversation/composer';
import { AssistantMessage, UserMessage } from '@/components/ai-conversation/message';
import { ThreadWelcome } from '@/components/ai-conversation/thread-welcome';

export function Thread() {
    const { messages, isEmpty, thinkingMessage, hasMoreMessages, isLoadingOlder, loadOlderMessages } = useChatThread();
    const viewportRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    // Scroll height before older messages were prepended, used to preserve the
    // viewport position so the user doesn't get jumped to a different message.
    const prevScrollHeightRef = useRef<number | null>(null);
    const loadingOlderRef = useRef(false);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
        setIsAtBottom(true);
    }, []);

    const handleScroll = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const distanceFromBottom =
            viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
        setIsAtBottom(distanceFromBottom < 80);

        // Upward pagination: when the user scrolls near the top, load older
        // messages. The scroll position is preserved by the layout effect below.
        if (
            viewport.scrollTop < 100 &&
            hasMoreMessages &&
            !isLoadingOlder &&
            !loadingOlderRef.current
        ) {
            loadingOlderRef.current = true;
            prevScrollHeightRef.current = viewport.scrollHeight;
            void loadOlderMessages().finally(() => {
                loadingOlderRef.current = false;
            });
        }
    }, [hasMoreMessages, isLoadingOlder, loadOlderMessages]);

    // After older messages are prepended, adjust scrollTop by the increase in
    // scrollHeight so the viewport stays on the same message.
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport || prevScrollHeightRef.current === null) return;
        const delta = viewport.scrollHeight - prevScrollHeightRef.current;
        if (delta > 0) {
            viewport.scrollTop += delta;
        }
        prevScrollHeightRef.current = null;
    }, [messages]);

    useEffect(() => {
        if (!isAtBottom) return;
        const frame = window.requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [isAtBottom, messages, thinkingMessage]);

    const threadStyle = { '--thread-max-width': '48rem' } as CSSProperties;

    return (
        <LazyMotion features={domAnimation}>
            <MotionConfig reducedMotion="user">
                <div
                    className="aui-root aui-thread-root @container flex min-h-0 flex-1 flex-col bg-transparent"
                    style={threadStyle}
                >
                    <div
                        ref={viewportRef}
                        onScroll={handleScroll}
                        className="aui-thread-viewport styled-scrollbar relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 md:px-6"
                    >
                        {isEmpty ? (
                            <ThreadWelcome />
                        ) : (
                            <>
                                {isLoadingOlder && (
                                    <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                                        <Loader2Icon className="size-3.5 animate-spin" />
                                        Loading older messages…
                                    </div>
                                )}
                                {messages.map((message, index) =>
                                    message.role === 'assistant' ? (
                                        <AssistantMessage
                                            key={message.id}
                                            message={message}
                                            isLast={index === messages.length - 1}
                                        />
                                    ) : (
                                        <UserMessage key={message.id} message={message} />
                                    ),
                                )}
                                <div className="aui-thread-viewport-spacer min-h-8 grow" />
                            </>
                        )}
                        <div ref={bottomRef} aria-hidden="true" className="h-px w-full shrink-0" />
                    </div>
                    <Composer
                        showScrollToBottom={!isAtBottom && messages.length > 0}
                        onScrollToBottom={() => scrollToBottom()}
                    />
                </div>
            </MotionConfig>
        </LazyMotion>
    );
}
