'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

import { useChatThread } from '@/components/ai-conversation/chat-context';
import { Composer } from '@/components/ai-conversation/composer';
import { AssistantMessage, UserMessage } from '@/components/ai-conversation/message';
import { ThreadWelcome } from '@/components/ai-conversation/thread-welcome';

export function Thread() {
    const { messages, isEmpty, thinkingMessage } = useChatThread();
    const viewportRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

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
    }, []);

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
