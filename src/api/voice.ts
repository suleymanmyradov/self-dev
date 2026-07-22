import { config } from '@/lib/config';

const ENDPOINTS = {
  TRANSCRIBE: '/personalization/transcribe',
  VOICE_TURN: '/personalization/voice-turn',
};

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
    throw new Error(text);
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
        callbacks.onError?.(text);
        return;
      }
      if (!res.body) {
        callbacks.onError?.('Response body is null');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          callbacks.onError?.('Stream ended unexpectedly');
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
                callbacks.onError?.(data.message ?? 'Unknown error');
                break;
            }
          } catch {
            // Ignore malformed JSON in an event.
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      callbacks.onError?.((err as Error).message);
    }
  })();

  return controller;
}

// --- helpers ---

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

interface SSEEvent {
  event: string;
  data: string;
}

function parseSSEEvent(raw: string): SSEEvent | null {
  let event = 'message';
  let data = '';
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data += line.slice(5).trim();
    }
  }
  if (!data) return null;
  return { event, data };
}
