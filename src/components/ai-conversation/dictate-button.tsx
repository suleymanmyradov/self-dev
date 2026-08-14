'use client';

import { useState, useRef, useCallback, useEffect, type FC } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatComposer } from '@/components/ai-conversation/chat-context';
import { transcribeAudio } from '@/api/voice';
import { cn } from '@/lib/utils';

type DictateState = 'idle' | 'recording' | 'transcribing' | 'error';

/**
 * Dictate mic button for the composer. Press to start recording, press again
 * (or release) to stop — the captured audio is sent to /personalization/transcribe
 * and the returned text is appended to the composer input.
 *
 * Uses MediaRecorder (Web Audio API), which is supported in all modern browsers
 * and React Native WebViews — so the same flow works on web today and mobile
 * later. Audio never touches the browser's Web Speech API; transcription runs
 * server-side via the pluggable pkg/speech STT provider.
 */
export const DictateButton: FC = () => {
    const { text, setText } = useChatComposer();
    const [state, setState] = useState<DictateState>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const textRef = useRef(text);

    useEffect(() => {
        textRef.current = text;
    }, [text]);

    const stopTracks = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }, []);

    const startRecording = useCallback(async () => {
        setErrorMsg('');
        if (!navigator.mediaDevices?.getUserMedia) {
            setState('error');
            setErrorMsg('Microphone not supported in this browser');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = pickMimeType();
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = event => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.onstop = async () => {
                stopTracks();
                const audio = new Blob(chunksRef.current, {
                    type: recorder.mimeType || 'audio/webm',
                });
                chunksRef.current = [];
                if (audio.size === 0) {
                    setState('idle');
                    return;
                }
                setState('transcribing');
                try {
                    const result = await transcribeAudio(audio);
                    if (result.text) {
                        const current = textRef.current;
                        const prefix = current && !/\s$/.test(current) ? ' ' : '';
                        setText(current + prefix + result.text);
                    }
                    setState('idle');
                } catch (err) {
                    setState('error');
                    setErrorMsg((err as Error).message || 'Transcription failed');
                    setTimeout(() => setState('idle'), 2000);
                }
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setState('recording');
        } catch (err) {
            stopTracks();
            setState('error');
            setErrorMsg(
                (err as Error).name === 'NotAllowedError'
                    ? 'Microphone permission denied'
                    : 'Could not start recording',
            );
            setTimeout(() => setState('idle'), 2000);
        }
    }, [setText, stopTracks]);

    const stopRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }
        mediaRecorderRef.current = null;
    }, []);

    const handleClick = useCallback(() => {
        if (state === 'recording') {
            stopRecording();
        } else if (state === 'idle') {
            void startRecording();
        }
    }, [startRecording, state, stopRecording]);

    const tooltip =
        state === 'recording'
            ? 'Stop recording'
            : state === 'transcribing'
              ? 'Transcribing…'
              : state === 'error'
                ? errorMsg || 'Dictate error'
                : 'Dictate (speech to text)';

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={state === 'transcribing'}
                    aria-label={tooltip}
                    className={cn(
                        'aui-composer-pill flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-[color,background-color] hover:bg-secondary hover:text-foreground',
                        state === 'recording' &&
                            'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15',
                        state === 'transcribing' && 'cursor-not-allowed opacity-60',
                    )}
                >
                    {state === 'transcribing' ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : state === 'recording' ? (
                        <MicOff className="size-3" />
                    ) : (
                        <Mic className="size-3" />
                    )}
                    <span>{state === 'recording' ? 'Stop' : state === 'transcribing' ? '…' : 'Dictate'}</span>
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{tooltip}</TooltipContent>
        </Tooltip>
    );
};

function pickMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
    ];
    for (const candidate of candidates) {
        if (MediaRecorder.isTypeSupported?.(candidate)) return candidate;
    }
    return undefined;
}
