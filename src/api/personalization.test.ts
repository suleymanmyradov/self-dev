import { afterEach, describe, expect, it, vi } from 'vitest';

import { streamPersonalizedCoaching } from './personalization';

function sseEvent(event: string, payload: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

function responseFromChunks(chunks: string[], status = 200): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream, { status, headers: { 'Content-Type': 'text/event-stream' } });
}

async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('streamPersonalizedCoaching', () => {
  it('sends the BFF request and dispatches ordered coaching events', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      responseFromChunks([
        sseEvent('thinking', { message: 'Reviewing your goals...' }),
        sseEvent('reasoning', { text: 'I am checking context. ' }),
        sseEvent('proposal', {
          id: 'proposal-1',
          action: 'create_goal',
          payload: { title: 'Read more' },
        }),
        sseEvent('delta', { text: 'A small step. ' }),
        sseEvent('delta', { text: 'Start tonight.' }),
        sseEvent('complete', { fullResponse: 'Start tonight.' }),
      ]),
    );
    const events: string[] = [];
    const controller = streamPersonalizedCoaching(
      {
        userMessage: 'Help me start',
        conversationId: 'conversation-1',
        attachments: [
          {
            attachmentType: 'image',
            name: 'plan.png',
            contentType: 'image/png',
            data: 'c2Vuc2l0aXZlLWZpeHR1cmU=',
          },
        ],
      },
      {
        onThinking: message => events.push(`thinking:${message}`),
        onReasoning: text => events.push(`reasoning:${text}`),
        onProposal: proposal => events.push(`proposal:${proposal.id}`),
        onDelta: text => events.push(`delta:${text}`),
        onComplete: text => events.push(`complete:${text}`),
        onError: message => events.push(`error:${message}`),
      },
    );

    await vi.waitFor(() => expect(events.at(-1)).toBe('complete:Start tonight.'));
    expect(events).toEqual([
      'thinking:Reviewing your goals...',
      'reasoning:I am checking context. ',
      'proposal:proposal-1',
      'delta:A small step. ',
      'delta:Start tonight.',
      'complete:Start tonight.',
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/personalization/coaching-stream');
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      userMessage: 'Help me start',
      conversationId: 'conversation-1',
      attachments: [
        {
          attachmentType: 'image',
          name: 'plan.png',
          contentType: 'image/png',
          data: 'c2Vuc2l0aXZlLWZpeHR1cmU=',
        },
      ],
    });
  });

  it('handles an event split across arbitrary network chunks', async () => {
    const stream = sseEvent('delta', { text: 'hello' }) + sseEvent('complete', { fullResponse: 'hello' });
    const split = Math.floor(stream.length / 2);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      responseFromChunks([stream.slice(0, split), stream.slice(split)]),
    );
    const deltas: string[] = [];
    const complete: string[] = [];

    streamPersonalizedCoaching(
      { userMessage: 'hello' },
      {
        onDelta: text => deltas.push(text),
        onComplete: text => complete.push(text),
        onError: message => complete.push(`error:${message}`),
      },
    );

    await vi.waitFor(() => expect(complete).toEqual(['hello']));
    expect(deltas).toEqual(['hello']);
  });

  it('treats a server error as terminal and ignores later events', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      responseFromChunks([
        sseEvent('error', { message: 'Please try again.' }),
        sseEvent('complete', { fullResponse: 'must not be delivered' }),
      ]),
    );
    const errors: string[] = [];
    const complete: string[] = [];

    streamPersonalizedCoaching(
      { userMessage: 'hello' },
      {
        onDelta: vi.fn(),
        onComplete: text => complete.push(text),
        onError: message => errors.push(message),
      },
    );

    await vi.waitFor(() => expect(errors).toEqual(['Please try again.']));
    await settle();
    expect(complete).toEqual([]);
  });

  it('normalizes non-2xx, null-body, malformed-event, and incomplete streams', async () => {
    const generic = "Something went wrong on my end. Please try sending your message again.";
    const cases: Array<() => Promise<Response>> = [
      async () => new Response('provider details', { status: 503 }),
      async () => new Response(null, { status: 200 }),
      async () => responseFromChunks(['event: delta\ndata: {not-json}\n\n']),
      async () => responseFromChunks([sseEvent('delta', { text: 'partial' })]),
    ];

    for (const makeResponse of cases) {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(await makeResponse());
      const errors: string[] = [];
      streamPersonalizedCoaching(
        { userMessage: 'hello' },
        { onDelta: vi.fn(), onComplete: vi.fn(), onError: message => errors.push(message) },
      );
      await vi.waitFor(() => expect(errors).toHaveLength(1));
      expect(errors[0]).toBe(generic);
      vi.restoreAllMocks();
    }
  });

  it('silently stops after abort and rejects invalid input before fetch', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise<Response>(() => undefined),
    );
    const errors: string[] = [];
    const controller = streamPersonalizedCoaching(
      { userMessage: 'hello' },
      { onDelta: vi.fn(), onComplete: vi.fn(), onError: message => errors.push(message) },
    );
    controller.abort();
    await settle();
    expect(errors).toEqual([]);

    const invalidErrors: string[] = [];
    streamPersonalizedCoaching(
      { userMessage: '' },
      { onDelta: vi.fn(), onComplete: vi.fn(), onError: message => invalidErrors.push(message) },
    );
    await vi.waitFor(() => expect(invalidErrors).toHaveLength(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
