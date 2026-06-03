import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listConversations, startConversation, getConversation, getMessages, sendMessage } from '@/api/conversations';
import type { StartConversationRequest, SendMessageRequest, ListConversationsParams, PageParams } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

/**
 * Hook to fetch conversations
 */
const DEFAULT_CONVERSATIONS_PARAMS: ListConversationsParams = { page: 1, limit: 20 };

export function useConversations(params: ListConversationsParams = DEFAULT_CONVERSATIONS_PARAMS) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => listConversations(params),
    select: (data) => data.data,
  });
}

/**
 * Hook to fetch a single conversation
 */
export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: () => getConversation(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Hook to fetch conversation messages
 */
const DEFAULT_MESSAGES_PARAMS: PageParams = { page: 1, limit: 50 };

export function useMessages(conversationId: string, params: PageParams = DEFAULT_MESSAGES_PARAMS) {
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages', params],
    queryFn: () => getMessages(conversationId, params),
    select: (data) => data.data,
    enabled: !!conversationId,
  });
}

/**
 * Hook to start a new conversation
 */
export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartConversationRequest) => startConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: handleMutationError,
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }) =>
      sendMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
    },
    onError: handleMutationError,
  });
}
