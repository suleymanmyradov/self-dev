'use client';

import { useState, useRef, useCallback, useEffect, type FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Mic, X, Loader2, Volume2, Sparkles } from 'lucide-react';
import { streamVoiceTurn } from '@/api/voice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

interface TurnMessage {
    role: 'user' | 'assistant';
    text: string;
}

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

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const audioElRef = useRef<HTMLAudioElement | null>(null);

    const stopTracks = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    // Cleanup on unmount.
    useEffect(() => {
        return () => {
            stopTracks();
            abortRef.current?.abort();
        };
    }, [stopTracks]);

    // --- callbacks (declared in dependency order: playAudio → sendVoiceTurn
    // → startRecording → stopRecording → handleMicClick) ---

    const playAudio = useCallback(async (audioBase64: string, format: string) => {
        setPhase('speaking');
        try {
            const mime = format === 'pcm' ? 'audio/pcm' : `audio/${format}`;
            // base64 → Blob → object URL. Using a Blob avoids data: URI
            // length limits and CSP restrictions on media-src.
            const bytes = atob(audioBase64);
            const buf = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
            const blob = new Blob([buf], { type: mime });
            const url = URL.createObjectURL(blob);
            const el = audioElRef.current;
            if (el) {
                el.src = url;
                el.onended = () => {
                    URL.revokeObjectURL(url);
                    setPhase('idle');
                };
                await el.play().catch(() => {
                    URL.revokeObjectURL(url);
                    setPhase('idle');
                });
            } else {
                URL.revokeObjectURL(url);
                setPhase('idle');
            }
        } catch {
            setPhase('idle');
        }
    }, []);

    const sendVoiceTurn = useCallback(
        (audio: Blob) => {
            // Assistant message placeholder — filled in by deltas.
            setMessages(prev => [
                ...prev,
                { role: 'user', text: '…' },
                { role: 'assistant', text: '' },
            ]);

            abortRef.current = streamVoiceTurn(
                audio,
                {
                    onTranscript: text => {
                        setMessages(prev => {
                            const next = [...prev];
                            const lastUser = [...next]
                                .reverse()
                                .findIndex(m => m.role === 'user');
                            if (lastUser >= 0) {
                                next[next.length - 1 - lastUser] = {
                                    role: 'user',
                                    text,
                                };
                            }
                            return next;
                        });
                        setPhase('thinking');
                    },
                    onConversation: id => {
                        setCurrentConversationId(id);
                        onConversationCreated?.(id);
                        void queryClient.invalidateQueries({
                            queryKey: ['conversations'],
                        });
                        // Update URL silently (mirrors the text flow).
                        window.history.replaceState(null, '', `/ai-coach/${id}`);
                    },
                    onDelta: text => {
                        setMessages(prev => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            if (last && last.role === 'assistant') {
                                next[next.length - 1] = {
                                    ...last,
                                    text: last.text + text,
                                };
                            }
                            return next;
                        });
                    },
                    onComplete: fullResponse => {
                        setMessages(prev => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            if (last && last.role === 'assistant') {
                                next[next.length - 1] = {
                                    role: 'assistant',
                                    text: fullResponse,
                                };
                            }
                            return next;
                        });
                    },
                    onAudio: (audioBase64, format) => {
                        void playAudio(audioBase64, format);
                    },
                    onReady: () => {
                        setPhase('idle');
                    },
                    onError: message => {
                        setPhase('error');
                        setErrorMsg(message);
                        // Remove the trailing assistant placeholder if it's empty.
                        setMessages(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === 'assistant' && !last.text) {
                                return prev.slice(0, -1);
                            }
                            return prev;
                        });
                        setTimeout(() => setPhase('idle'), 2500);
                    },
                },
                { conversationId: currentConversationId },
            );
        },
        [currentConversationId, onConversationCreated, queryClient, playAudio],
    );

    const startRecording = useCallback(async () => {
        setErrorMsg('');
        if (!navigator.mediaDevices?.getUserMedia) {
            setPhase('error');
            setErrorMsg('Microphone not supported in this browser');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;
            const mimeType = pickMimeType();
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = e => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                stopTracks();
                const audio = new Blob(chunksRef.current, {
                    type: recorder.mimeType || 'audio/webm',
                });
                chunksRef.current = [];
                if (audio.size === 0) {
                    setPhase('idle');
                    return;
                }
                setPhase('transcribing');
                sendVoiceTurn(audio);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setPhase('recording');
        } catch (err) {
            stopTracks();
            setPhase('error');
            setErrorMsg(
                (err as Error).name === 'NotAllowedError'
                    ? 'Microphone permission denied'
                    : 'Could not start recording',
            );
        }
    }, [stopTracks, sendVoiceTurn]);

    const stopRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }
        mediaRecorderRef.current = null;
    }, []);

    const handleMicClick = useCallback(() => {
        if (phase === 'recording') {
            stopRecording();
        } else if (phase === 'idle' || phase === 'error') {
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
            {/* Hidden audio element for TTS playback. */}
            <audio ref={audioElRef} className="hidden" />

            {/* Header */}
            <div className="flex w-full max-w-2xl items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-5 text-calm" />
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
                                m.role === 'user' ? 'justify-end' : 'justify-start',
                            )}
                        >
                            <div
                                className={cn(
                                    'max-w-[80%] rounded-2xl px-4 py-3 text-base leading-relaxed',
                                    m.role === 'user'
                                        ? 'bg-calm-soft text-foreground'
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
                        'flex size-20 items-center justify-center rounded-full shadow-lg transition-all',
                        phase === 'recording'
                            ? 'bg-destructive text-destructive-foreground scale-110 animate-pulse'
                            : phase === 'speaking'
                              ? 'bg-calm text-calm-foreground'
                              : phase === 'error'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-calm text-calm-foreground hover:scale-105',
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

function pickMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
    ];
    for (const c of candidates) {
        if (MediaRecorder.isTypeSupported?.(c)) return c;
    }
    return undefined;
}
