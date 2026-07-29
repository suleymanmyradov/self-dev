'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { streamVoiceTurn } from '@/api/voice';

export interface TurnMessage {
    role: 'user' | 'assistant';
    text: string;
}

export interface VoiceTurnStreamCallbacks {
    onTranscript?: (text: string) => void;
    onConversation?: (id: string) => void;
    onDelta?: (text: string) => void;
    onComplete?: (fullResponse: string) => void;
    onAudio?: (audioBase64: string, format: string) => void;
    onReady?: () => void;
    onError?: (message: string) => void;
}

export function setLastUserMessage(
    prev: TurnMessage[],
    text: string,
): TurnMessage[] {
    const next = [...prev];
    const i = [...next].reverse().findIndex(m => m.role === 'user');
    if (i >= 0) next[next.length - 1 - i] = { role: 'user', text };
    return next;
}

export function appendAssistantDelta(
    prev: TurnMessage[],
    text: string,
): TurnMessage[] {
    const next = [...prev];
    const last = next[next.length - 1];
    if (last?.role === 'assistant')
        next[next.length - 1] = { ...last, text: last.text + text };
    return next;
}

export function setAssistantComplete(
    prev: TurnMessage[],
    text: string,
): TurnMessage[] {
    const next = [...prev];
    const last = next[next.length - 1];
    if (last?.role === 'assistant')
        next[next.length - 1] = { role: 'assistant', text };
    return next;
}

export function removeEmptyAssistant(prev: TurnMessage[]): TurnMessage[] {
    const last = prev[prev.length - 1];
    return last?.role === 'assistant' && !last.text ? prev.slice(0, -1) : prev;
}

export function useVoiceTurnStream(callbacks: VoiceTurnStreamCallbacks) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [accumulatedText, setAccumulatedText] = useState('');
    const abortRef = useRef<AbortController | null>(null);
    const callbacksRef = useRef(callbacks);
    useEffect(() => { callbacksRef.current = callbacks; });

    const streamTurn = useCallback((audio: Blob, conversationId?: string) => {
        setAccumulatedText('');
        setIsStreaming(true);
        abortRef.current = streamVoiceTurn(
            audio,
            {
                onTranscript: text => callbacksRef.current.onTranscript?.(text),
                onConversation: id => callbacksRef.current.onConversation?.(id),
                onDelta: text => {
                    setAccumulatedText(prev => prev + text);
                    callbacksRef.current.onDelta?.(text);
                },
                onComplete: fullResponse => {
                    setAccumulatedText(fullResponse);
                    callbacksRef.current.onComplete?.(fullResponse);
                },
                onAudio: (audioBase64, format) =>
                    callbacksRef.current.onAudio?.(audioBase64, format),
                onReady: () => {
                    setIsStreaming(false);
                    callbacksRef.current.onReady?.();
                },
                onError: message => {
                    setIsStreaming(false);
                    callbacksRef.current.onError?.(message);
                },
            },
            { conversationId },
        );
    }, []);

    const abort = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
    }, []);

    // Cleanup on unmount.
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    return { streamTurn, abort, isStreaming, accumulatedText };
}
