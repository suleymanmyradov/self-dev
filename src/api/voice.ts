import { config } from '@/lib/config';
import { parseSSEEvent } from '@/lib/sse';

const ENDPOINTS = {
  TRANSCRIBE: '/personalization/transcribe',
  VOICE_TURN: '/personalization/voice-turn',
};

// Backend enforces a 25 MB upload cap (matching the OpenAI Whisper limit) for
// both transcribe and voice-turn. Validate client-side to avoid wasting
// bandwidth on uploads the server will reject.
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export interface TranscribeResponse {
  text: string;
  language?: string;
  duration?: number;
}

/**
 * Transcribe an audio blob into text. Used by the dictate mic button in the
 * composer: the browser captures audio via MediaRecorder, uploads it, and the
 * returned text is inserted into the message input.
 */
export async function transcribeAudio(
  audio: Blob,
  language?: string,
): Promise<TranscribeResponse> {
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new Error(`Audio exceeds the 25 MB upload limit (${(audio.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  const form = new FormData();
  // MediaRecorder produces audio/webm on Chrome/Firefox, audio/mp4 on Safari.
  // The filename extension tells the backend the format; the MIME type is a
  // fallback.
  const ext = audioExtensionFor(audio.type);
  form.append('audio', audio, `dictate.${ext}`);
  if (language) form.append('language', language);

  const res = await fetch(`${config.apiUrl}${ENDPOINTS.TRANSCRIBE}`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Transcription failed');
    console.error('[transcribe] HTTP error', res.status, text);
    throw new Error(VOICE_ERROR_GENERIC);
  }
  return res.json() as Promise<TranscribeResponse>;
}

// --- Live voice chat (SSE) ---

export interface VoiceTurnCallbacks {
  onTranscript?: (text: string, language: string, duration: number) => void;
  onConversation?: (id: string) => void;
  onDelta?: (text: string) => void;
  onComplete?: (fullResponse: string) => void;
  onAudio?: (audioBase64: string, format: string) => void;
  onReady?: () => void;
  onError?: (message: string) => void;
}

/**
 * Stream a voice turn: uploads one audio utterance and reads the SSE response
 * (transcript → coaching deltas → complete → TTS audio → ready). Returns an
 * AbortController so the caller can cancel.
 *
 * This is the live voice chat transport — turn-based. The caller records one
 * utterance with MediaRecorder, calls this, and plays back the spoken response.
 */
export function streamVoiceTurn(
  audio: Blob,
  callbacks: VoiceTurnCallbacks,
  options?: { language?: string; conversationId?: string },
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      if (audio.size > MAX_AUDIO_BYTES) {
        callbacks.onError?.(`Audio exceeds the 25 MB upload limit (${(audio.size / 1024 / 1024).toFixed(1)} MB)`);
        return;
      }
      const form = new FormData();
      const ext = audioExtensionFor(audio.type);
      form.append('audio', audio, `voice.${ext}`);
      if (options?.language) form.append('language', options.language);
      if (options?.conversationId)
        form.append('conversationId', options.conversationId);

      const res = await fetch(`${config.apiUrl}${ENDPOINTS.VOICE_TURN}`, {
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        body: form,
        credentials: 'include',
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => 'Voice turn failed');
        console.error('[voice-stream] HTTP error', res.status, text);
        callbacks.onError?.(VOICE_ERROR_GENERIC);
        return;
      }
      if (!res.body) {
        console.error('[voice-stream] response body is null');
        callbacks.onError?.(VOICE_ERROR_GENERIC);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.error('[voice-stream] stream ended without ready event');
          callbacks.onError?.(VOICE_ERROR_GENERIC);
          return;
        }
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const parsed = parseSSEEvent(rawEvent);
          if (!parsed) continue;

          try {
            const data = JSON.parse(parsed.data);
            switch (parsed.event) {
              case 'transcript':
                callbacks.onTranscript?.(
                  data.text ?? '',
                  data.language ?? '',
                  data.duration ?? 0,
                );
                break;
              case 'conversation':
                callbacks.onConversation?.(data.id);
                break;
              case 'delta':
                callbacks.onDelta?.(data.text ?? '');
                break;
              case 'complete':
                callbacks.onComplete?.(data.fullResponse ?? '');
                break;
              case 'audio':
                callbacks.onAudio?.(data.data ?? '', data.format ?? 'mp3');
                break;
              case 'ready':
                callbacks.onReady?.();
                return;
              case 'error':
                callbacks.onError?.(data.message ?? VOICE_ERROR_GENERIC);
                break;
            }
          } catch (parseErr) {
            // Log malformed JSON so backend issues are debuggable; don't crash the stream.
            console.error('[voice stream] malformed JSON in SSE event:', parsed.event, parseErr);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('[voice-stream] fetch failed', err);
      callbacks.onError?.(VOICE_ERROR_GENERIC);
    }
  })();

  return controller;
}

// --- helpers ---

/**
 * Generic user-facing error message for voice/transcribe failures that don't
 * come with a server-provided message. Technical details are logged to the
 * console for debugging; the user only sees this friendly fallback.
 */
const VOICE_ERROR_GENERIC =
  "I couldn't process your audio. Please try again.";

/** Derive a filename extension from a MediaRecorder MIME type. */
function audioExtensionFor(mimeType: string): string {
  const mt = (mimeType || '').toLowerCase();
  if (mt.includes('webm')) return 'webm';
  if (mt.includes('ogg')) return 'ogg';
  if (mt.includes('mp4') || mt.includes('m4a')) return 'm4a';
  if (mt.includes('mp3') || mt.includes('mpeg')) return 'mp3';
  if (mt.includes('wav')) return 'wav';
  if (mt.includes('aac')) return 'aac';
  // Default: webm is the most common MediaRecorder output.
  return 'webm';
}
