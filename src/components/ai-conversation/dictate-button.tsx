'use client';

import { useState, useRef, useCallback, type FC } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useComposerRuntime } from '@assistant-ui/react';
import { transcribeAudio } from '@/api/voice';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
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
    const composer = useComposerRuntime();
    const [state, setState] = useState<DictateState>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const stopTracks = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
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

            // Pick the best supported MIME type for MediaRecorder. Chrome/
            // Firefox default to audio/webm; Safari to audio/mp4. The backend
            // derives the format from the filename extension we send.
            const mimeType = pickMimeType();
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = e => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
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
                        // Append to whatever is already in the composer,
                        // adding a space if there's existing text without
                        // trailing whitespace.
                        const current = composer.getState().text;
                        const prefix = current && !/\s$/.test(current) ? ' ' : '';
                        composer.setText(current + prefix + result.text);
                    }
                    setState('idle');
                } catch (err) {
                    setState('error');
                    setErrorMsg((err as Error).message || 'Transcription failed');
                    // Auto-recover from the error state after 2s.
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
    }, [composer, stopTracks]);

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
        // In transcribing/error states, ignore clicks.
    }, [state, startRecording, stopRecording]);

    const tooltip =
        state === 'recording'
            ? 'Stop recording'
            : state === 'transcribing'
              ? 'Transcribing…'
              : state === 'error'
                ? errorMsg || 'Dictate error'
                : 'Dictate (speech to text)';

    return (
        <TooltipIconButton
            tooltip={tooltip}
            side="bottom"
            variant="ghost"
            size="icon"
            className={cn(
                'aui-composer-dictate size-[34px] rounded-full p-1',
                state === 'recording' &&
                    'bg-destructive/10 text-destructive hover:bg-destructive/15',
            )}
            aria-label={tooltip}
            disabled={state === 'transcribing'}
            onClick={handleClick}
        >
            {state === 'transcribing' ? (
                <Loader2 className="size-5 animate-spin" />
            ) : state === 'recording' ? (
                <MicOff className="size-5" />
            ) : (
                <Mic className="size-5" />
            )}
        </TooltipIconButton>
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
    for (const c of candidates) {
        if (MediaRecorder.isTypeSupported?.(c)) return c;
    }
    return undefined;
}
