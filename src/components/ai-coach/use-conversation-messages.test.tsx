// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mocks = vi.hoisted(() => ({
  startConversation: vi.fn(),
  getMessages: vi.fn(),
  streamPersonalizedCoaching: vi.fn(),
  callbacks: undefined as
    | {
        onThinking?: (message: string) => void;
        onReasoning?: (text: string) => void;
        onProposal?: (proposal: { id: string; action: 'create_goal'; payload: Record<string, unknown> }) => void;
        onDelta: (text: string) => void;
        onComplete: (text: string) => void;
        onError: (message: string) => void;
      }
    | undefined,
  abort: vi.fn(),
}));

vi.mock('@/api/conversations', () => ({
  startConversation: mocks.startConversation,
  getMessages: mocks.getMessages,
}));
vi.mock('@/api/personalization', () => ({
  streamPersonalizedCoaching: (data: unknown, callbacks: typeof mocks.callbacks) => {
    mocks.streamPersonalizedCoaching(data, callbacks);
    mocks.callbacks = callbacks;
    return { abort: mocks.abort };
  },
}));

const { useConversationMessages } = await import('./use-conversation-messages');

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function QueryClientWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return QueryClientWrapper;
}

afterEach(() => {
  vi.clearAllMocks();
  mocks.callbacks = undefined;
});

describe('useConversationMessages', () => {
  it('does not fetch history for a new conversation and streams a newly created turn', async () => {
    mocks.startConversation.mockResolvedValue({ data: { id: 'conversation-1' } });
    const { result } = renderHook(() => useConversationMessages(), { wrapper: wrapper() });

    await act(async () => {
      await result.current.onNew('Help me plan', { displayText: 'Help me plan' });
    });

    expect(mocks.getMessages).not.toHaveBeenCalled();
    expect(mocks.startConversation).toHaveBeenCalledWith({ type: 'coach', title: 'Help me plan' });
    expect(mocks.streamPersonalizedCoaching).toHaveBeenCalledWith(
      { userMessage: 'Help me plan', conversationId: 'conversation-1', attachments: undefined },
      expect.anything(),
    );
    expect(result.current.messages.map(message => [message.role, message.status])).toEqual([
      ['user', 'complete'],
      ['assistant', 'running'],
    ]);

    await act(async () => {
      mocks.callbacks?.onThinking?.('Considering your options...');
      mocks.callbacks?.onReasoning?.('First, inspect the blocker.');
      mocks.callbacks?.onDelta('Start with one step.');
      mocks.callbacks?.onComplete('Start with one step.');
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.thinkingMessage).toBeNull();
    expect(result.current.messages[1]).toMatchObject({
      content: 'Start with one step.',
      reasoning: 'First, inspect the blocker.',
      status: 'complete',
    });
  });

  it('loads an existing conversation and sends the next turn with its id', async () => {
    mocks.getMessages.mockResolvedValue({
      data: [
        { id: 'user-1', role: 'user', content: 'Earlier' },
        { id: 'assistant-1', role: 'assistant', content: 'Earlier reply' },
      ],
    });
    const { result } = renderHook(() => useConversationMessages('conversation-2'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.currentConversationId).toBe('conversation-2');

    await act(async () => {
      await result.current.onNew('Continue');
    });
    expect(mocks.startConversation).not.toHaveBeenCalled();
    expect(mocks.streamPersonalizedCoaching).toHaveBeenCalledWith(
      { userMessage: 'Continue', conversationId: 'conversation-2', attachments: undefined },
      expect.anything(),
    );
  });

  it('keeps received text when cancellation aborts the active stream', async () => {
    mocks.startConversation.mockResolvedValue({ data: { id: 'conversation-3' } });
    const { result } = renderHook(() => useConversationMessages(), { wrapper: wrapper() });
    await act(async () => {
      await result.current.onNew('Stop me');
      mocks.callbacks?.onDelta('Partial answer');
    });

    await act(async () => {
      await result.current.onCancel();
    });

    expect(mocks.abort).toHaveBeenCalled();
    expect(result.current.isRunning).toBe(false);
    expect(result.current.messages.at(-1)).toMatchObject({
      content: 'Partial answer',
      status: 'complete',
    });
  });

  it('marks the assistant complete and records stream errors without throwing', async () => {
    mocks.startConversation.mockResolvedValue({ data: { id: 'conversation-4' } });
    const { result } = renderHook(() => useConversationMessages(), { wrapper: wrapper() });
    await act(async () => {
      await result.current.onNew('Fail me');
      mocks.callbacks?.onError('Safe failure');
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.messages.at(-1)).toMatchObject({
      error: 'Safe failure',
      status: 'complete',
    });
  });
});
