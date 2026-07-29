'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayback() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const el = new Audio();
        audioRef.current = el;
        return () => {
            el.pause();
            el.src = '';
        };
    }, []);

    const playAudioChunk = useCallback(
        async (audioBase64: string, format: string) => {
            setIsPlaying(true);
            try {
                const mime = format === 'pcm' ? 'audio/pcm' : `audio/${format}`;
                // base64 → Blob → object URL. Using a Blob avoids data: URI
                // length limits and CSP restrictions on media-src.
                const bytes = atob(audioBase64);
                const buf = new Uint8Array(bytes.length);
                for (let i = 0; i < bytes.length; i++)
                    buf[i] = bytes.charCodeAt(i);
                const blob = new Blob([buf], { type: mime });
                const url = URL.createObjectURL(blob);
                const el = audioRef.current;
                if (el) {
                    el.src = url;
                    el.onended = () => {
                        URL.revokeObjectURL(url);
                        setIsPlaying(false);
                    };
                    await el.play().catch(() => {
                        URL.revokeObjectURL(url);
                        setIsPlaying(false);
                    });
                } else {
                    URL.revokeObjectURL(url);
                    setIsPlaying(false);
                }
            } catch {
                setIsPlaying(false);
            }
        },
        [],
    );

    const stopPlayback = useCallback(() => {
        const el = audioRef.current;
        if (el) {
            el.pause();
            el.src = '';
        }
        setIsPlaying(false);
    }, []);

    return { playAudioChunk, stopPlayback, isPlaying };
}
