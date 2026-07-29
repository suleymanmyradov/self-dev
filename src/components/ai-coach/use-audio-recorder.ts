'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const stopTracks = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    // Cleanup on unmount.
    useEffect(() => {
        return () => {
            stopTracks();
        };
    }, [stopTracks]);

    const startRecording = useCallback(async () => {
        setError('');
        setAudioBlob(null);
        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Microphone not supported in this browser');
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
                    setIsRecording(false);
                    return;
                }
                setAudioBlob(audio);
                setIsRecording(false);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch (err) {
            stopTracks();
            setError(
                (err as Error).name === 'NotAllowedError'
                    ? 'Microphone permission denied'
                    : 'Could not start recording',
            );
        }
    }, [stopTracks]);

    const stopRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }
        mediaRecorderRef.current = null;
    }, []);

    const reset = useCallback(() => {
        setAudioBlob(null);
        setError('');
    }, []);

    return { isRecording, startRecording, stopRecording, audioBlob, reset, error };
}
