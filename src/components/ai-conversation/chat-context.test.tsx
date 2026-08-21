// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ChatProvider, useChat } from './chat-context';
import type { CoachingMessage, useConversationMessages } from '@/components/ai-coach/use-conversation-messages';

type TestState = ReturnType<typeof useConversationMessages>;

function createState(overrides: Record<string, unknown> = {}): TestState {
  return {
    messages: [] as CoachingMessage[],
    setMessages: vi.fn(),
    isRunning: false,
    thinkingMessage: null,
    currentConversationId: undefined,
    setCurrentConversationId: vi.fn(),
    onNew: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn().mockResolvedValue(undefined),
    onReset: vi.fn(),
    ...overrides,
  };
}

afterEach(() => vi.restoreAllMocks());

describe('ChatProvider', () => {
  it('ignores empty sends but allows an attachment-only turn', async () => {
    const state = createState();
    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ChatProvider state={state}>{children}</ChatProvider>
      ),
    });

    await act(async () => {
      await result.current.send('   ');
    });
    expect(state.onNew).not.toHaveBeenCalled();

    await act(async () => {
      result.current.addAttachment(new File(['fixture'], 'notes.txt', { type: 'text/plain' }));
    });
    expect(result.current.attachments).toHaveLength(1);
    await act(async () => {
      await result.current.send('');
    });
    await waitFor(() => expect(state.onNew).toHaveBeenCalledTimes(1));
    const onNewMock = state.onNew as unknown as ReturnType<typeof vi.fn>;
    expect(onNewMock.mock.calls[0][0]).toContain('fixture');
    expect(onNewMock.mock.calls[0][1]).toMatchObject({ displayText: '', attachments: expect.any(Array) });
    expect(result.current.text).toBe('');
    expect(result.current.attachments).toEqual([]);
  });

  it('blocks sending while a turn is running and delegates cancellation', async () => {
    const state = createState({ isRunning: true });
    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ChatProvider state={state}>{children}</ChatProvider>
      ),
    });

    await act(async () => {
      result.current.setText('blocked');
      await result.current.send();
      result.current.cancel();
    });
    expect(state.onNew).not.toHaveBeenCalled();
    expect(state.onCancel).toHaveBeenCalledTimes(1);
  });

  it('adds supported files, ignores unsupported files, and revokes image previews on removal', async () => {
    const state = createState();
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ChatProvider state={state}>{children}</ChatProvider>
      ),
    });

    await act(async () => {
      result.current.addAttachment(new File(['pixels'], 'photo.png', { type: 'image/png' }));
      result.current.addAttachment(new File(['binary'], 'archive.zip', { type: 'application/zip' }));
    });
    expect(result.current.attachments).toHaveLength(1);
    const id = result.current.attachments[0].id;
    await act(async () => result.current.removeAttachment(id));
    expect(revoke).toHaveBeenCalledWith('blob:preview');
    expect(result.current.attachments).toEqual([]);
  });

  it('finds the preceding user message when retrying an assistant response', async () => {
    const state = createState({
      messages: [
        { id: 'u', role: 'user', content: 'Original', status: 'complete' },
        { id: 'a', role: 'assistant', content: 'Error', status: 'complete', error: 'failed' },
      ],
    });
    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ChatProvider state={state}>{children}</ChatProvider>
      ),
    });

    await act(async () => result.current.retry('a'));
    expect(state.onNew).toHaveBeenCalledWith(
      'Original',
      expect.objectContaining({ displayText: 'Original', regenerateMessageId: 'a' }),
    );
  });
});
