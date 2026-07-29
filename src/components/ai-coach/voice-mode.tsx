'use client';

import { useState, useRef, useCallback, useEffect, type FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Mic, X, Loader2, Volume2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAudioRecorder } from './use-audio-recorder';
import {
    useVoiceTurnStream,
    setLastUserMessage,
    appendAssistantDelta,
    setAssistantComplete,
    removeEmptyAssistant,
    type TurnMessage,
} from './use-voice-turn-stream';
import { useAudioPlayback } from './use-audio-playback';

interface VoiceModeProps {
    /** Current conversation ID, if any. Voice turns use/extend this conversation. */
    conversationId?: string;
    /** Called when a new conversation is created during a voice turn. */
    onConversationCreated?: (id: string) => void;
    /** Called when the user closes voice mode. */
    onClose: () => void;
}

type Phase =
    | 'idle' // waiting for the user to tap the mic
    | 'recording' // capturing audio
    | 'transcribing' // sending audio, waiting for transcript
    | 'thinking' // transcript received, coaching streaming
    | 'speaking' // playing TTS audio
    | 'error';

/**
 * Full-screen live voice chat mode (ChatGPT-style). The user taps the mic,
 * speaks, taps again to stop; the server transcribes, streams a coaching
 * response, and synthesizes spoken audio which plays automatically. After
 * playback the mic re-enables for the next turn.
 *
 * Transport is SSE over POST /personalization/voice-turn (turn-based, not
 * full-duplex) so it flows through the existing BFF proxy with cookie auth.
 */
export const VoiceMode: FC<VoiceModeProps> = ({
    conversationId,
    onConversationCreated,
    onClose,
}) => {
    const queryClient = useQueryClient();
    const [phase, setPhase] = useState<Phase>('idle');
    const [messages, setMessages] = useState<TurnMessage[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [currentConversationId, setCurrentConversationId] =
        useState(conversationId);
    const streamedRef = useRef(false);
    const prevIsPlaying = useRef(false);

    const {
        isRecording,
        startRecording,
        stopRecording,
        audioBlob,
        reset: resetRecording,
        error: recorderError,
    } = useAudioRecorder();

    const { playAudioChunk, isPlaying } = useAudioPlayback();

    const { streamTurn } = useVoiceTurnStream({
        onTranscript: text => {
            setMessages(prev => setLastUserMessage(prev, text));
            setPhase('thinking');
        },
        onConversation: id => {
            setCurrentConversationId(id);
            onConversationCreated?.(id);
            void queryClient.invalidateQueries({ queryKey: ['conversations'] });
            // Update URL silently (mirrors the text flow).
            window.history.replaceState(null, '', `/coach/${id}`);
        },
        onDelta: text => setMessages(prev => appendAssistantDelta(prev, text)),
        onComplete: fullResponse =>
            setMessages(prev => setAssistantComplete(prev, fullResponse)),
        onAudio: (audioBase64, format) => {
            setPhase('speaking');
            void playAudioChunk(audioBase64, format);
        },
        onReady: () => {
            streamedRef.current = false;
            setPhase('idle');
        },
        onError: message => {
            streamedRef.current = false;
            setPhase('error');
            setErrorMsg(message);
            // Remove the trailing assistant placeholder if it's empty.
            setMessages(removeEmptyAssistant);
            setTimeout(() => setPhase('idle'), 2500);
        },
    });

    // Recording state and recorder errors → phase.
    useEffect(() => {
        if (recorderError) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPhase('error');
            setErrorMsg(recorderError);
            return;
        }
        if (isRecording) setPhase('recording');
    }, [isRecording, recorderError]);

    // Audio blob ready → start streaming.
    useEffect(() => {
        if (audioBlob && !streamedRef.current) {
            streamedRef.current = true;
            // Assistant message placeholder — filled in by deltas.
            setMessages(prev => [
                ...prev,
                { role: 'user', text: '…' },
                { role: 'assistant', text: '' },
            ]);
            setPhase('transcribing');
            streamTurn(audioBlob, currentConversationId);
            resetRecording();
        }
    }, [audioBlob, streamTurn, currentConversationId, resetRecording]);

    // Playback ended → idle.
    useEffect(() => {
        if (prevIsPlaying.current && !isPlaying) setPhase('idle');
        prevIsPlaying.current = isPlaying;
    }, [isPlaying]);

    const handleMicClick = useCallback(() => {
        if (phase === 'recording') {
            stopRecording();
        } else if (phase === 'idle' || phase === 'error') {
            setErrorMsg('');
            void startRecording();
        }
        // During transcribing/thinking/speaking the mic is disabled.
    }, [phase, startRecording, stopRecording]);

    const micLabel =
        phase === 'recording'
            ? 'Tap to stop'
            : phase === 'transcribing'
              ? 'Transcribing…'
              : phase === 'thinking'
                ? 'Thinking…'
                : phase === 'speaking'
                  ? 'Speaking…'
                  : phase === 'error'
                    ? errorMsg || 'Error — tap to retry'
                    : 'Tap to speak';

    const micDisabled =
        phase === 'transcribing' || phase === 'thinking' || phase === 'speaking';

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-background/95 p-6 backdrop-blur-md">
            {/* Header */}
            <div className="flex w-full max-w-2xl items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-5 text-accent" />
                    <span className="font-display text-lg font-semibold">
                        Voice Coach
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close voice mode"
                    className="rounded-full"
                >
                    <X className="size-5" />
                </Button>
            </div>

            {/* Transcript area */}
            <div className="styled-scrollbar flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto py-8">
                {messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                        <p className="font-display text-2xl font-semibold text-foreground">
                            Speak with your coach
                        </p>
                        <p className="max-w-sm text-sm">
                            Tap the microphone below and talk naturally. Your
                            coach will listen, respond, and speak back.
                        </p>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex',
                                m.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start',
                            )}
                        >
                            <div
                                className={cn(
                                    'max-w-[80%] rounded-2xl px-4 py-3 text-base leading-relaxed',
                                    m.role === 'user'
                                        ? 'bg-accent/10 text-foreground'
                                        : 'bg-muted/60 text-foreground',
                                )}
                            >
                                {m.text || (
                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                        <Loader2 className="size-4 animate-spin" />
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Mic control */}
            <div className="flex flex-col items-center gap-3 pb-4">
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={micDisabled}
                    aria-label={micLabel}
                    className={cn(
                        'flex size-20 items-center justify-center rounded-full shadow-lg transition-[background-color,box-shadow,transform]',
                        phase === 'recording'
                            ? 'bg-destructive text-destructive-foreground scale-110 animate-pulse'
                            : phase === 'speaking'
                              ? 'bg-accent text-accent-foreground'
                              : phase === 'error'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-accent text-accent-foreground hover:scale-105',
                        micDisabled && 'cursor-not-allowed opacity-60',
                    )}
                >
                    {phase === 'transcribing' || phase === 'thinking' ? (
                        <Loader2 className="size-8 animate-spin" />
                    ) : phase === 'speaking' ? (
                        <Volume2 className="size-8" />
                    ) : (
                        <Mic className="size-8" />
                    )}
                </button>
                <p className="text-sm text-muted-foreground">{micLabel}</p>
            </div>
        </div>
    );
};
