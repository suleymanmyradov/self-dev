import { afterEach, describe, expect, it, vi } from 'vitest';

import { streamVoiceTurn, transcribeAudio } from './voice';

function sseEvent(event: string, payload: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

function responseFromChunks(chunks: string[], status = 200): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, { status, headers: { 'Content-Type': 'text/event-stream' } });
}

afterEach(() => vi.restoreAllMocks());

describe('transcribeAudio', () => {
  it('posts the audio with a MIME-derived filename and optional language', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ text: 'hello', language: 'en', duration: 1.2 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const audio = new Blob(['audio'], { type: 'audio/mp4' });

    await expect(transcribeAudio(audio, 'en')).resolves.toEqual({
      text: 'hello',
      language: 'en',
      duration: 1.2,
    });
    const [, init] = fetchMock.mock.calls[0];
    const form = init?.body as FormData;
    expect(form.get('language')).toBe('en');
    expect((form.get('audio') as File).name).toBe('dictate.m4a');
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' });
  });

  it('rejects an oversized recording without issuing a request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const audio = new Blob([new Uint8Array(25 * 1024 * 1024 + 1)], { type: 'audio/webm' });

    await expect(transcribeAudio(audio)).rejects.toThrow('25 MB upload limit');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('streamVoiceTurn', () => {
  it('dispatches transcript, conversation, text, audio, and ready in order', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      responseFromChunks([
        sseEvent('transcript', { text: 'What next?', language: 'en', duration: 2 }),
        sseEvent('conversation', { id: 'conversation-2' }),
        sseEvent('delta', { text: 'Try one small action.' }),
        sseEvent('complete', { fullResponse: 'Try one small action.' }),
        sseEvent('audio', { data: 'YXVkaW8=', format: 'mp3' }),
        sseEvent('ready', {}),
      ]),
    );
    const events: string[] = [];

    streamVoiceTurn(
      new Blob(['audio'], { type: 'audio/webm;codecs=opus' }),
      {
        onTranscript: (text, language, duration) => events.push(`transcript:${text}:${language}:${duration}`),
        onConversation: id => events.push(`conversation:${id}`),
        onDelta: text => events.push(`delta:${text}`),
        onComplete: text => events.push(`complete:${text}`),
        onAudio: (data, format) => events.push(`audio:${data}:${format}`),
        onReady: () => events.push('ready'),
        onError: message => events.push(`error:${message}`),
      },
      { language: 'en', conversationId: 'conversation-1' },
    );

    await vi.waitFor(() => expect(events.at(-1)).toBe('ready'));
    expect(events).toEqual([
      'transcript:What next?:en:2',
      'conversation:conversation-2',
      'delta:Try one small action.',
      'complete:Try one small action.',
      'audio:YXVkaW8=:mp3',
      'ready',
    ]);
    const [, init] = fetchMock.mock.calls[0];
    const form = init?.body as FormData;
    expect((form.get('audio') as File).name).toBe('voice.webm');
    expect(form.get('language')).toBe('en');
    expect(form.get('conversationId')).toBe('conversation-1');
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' });
  });

  it('treats premature EOF and HTTP failure as generic terminal errors', async () => {
    const generic = "I couldn't process your audio. Please try again.";
    const errors: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(responseFromChunks([sseEvent('delta', { text: 'partial' })]));
    streamVoiceTurn(new Blob(['audio'], { type: 'audio/wav' }), {
      onDelta: vi.fn(),
      onError: message => errors.push(message),
    });
    await vi.waitFor(() => expect(errors).toEqual([generic]));

    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('failure', { status: 500 }));
    const httpErrors: string[] = [];
    streamVoiceTurn(new Blob(['audio'], { type: 'audio/ogg' }), {
      onDelta: vi.fn(),
      onError: message => httpErrors.push(message),
    });
    await vi.waitFor(() => expect(httpErrors).toEqual([generic]));
  });

  it('does not report an abort as a user-visible error', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }),
    );
    const errors: string[] = [];
    const controller = streamVoiceTurn(new Blob(['audio'], { type: 'audio/webm' }), {
      onDelta: vi.fn(),
      onError: message => errors.push(message),
    });
    controller.abort();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(errors).toEqual([]);
  });
});
