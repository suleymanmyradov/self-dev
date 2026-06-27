import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listConversations, startConversation, getConversation, getMessages, sendMessage, archiveConversation, unarchiveConversation, deleteConversation } from '@/api/conversations';
import type { StartConversationRequest, SendMessageRequest, ListConversationsParams, PageParams } from '@/api';

/**
 * Hook to fetch conversations
 */
const DEFAULT_CONVERSATIONS_PARAMS: ListConversationsParams = { page: 1, limit: 20 };

export function useConversations(params: ListConversationsParams = DEFAULT_CONVERSATIONS_PARAMS) {
  const { page, limit, type } = params;
  return useQuery({
    queryKey: ['conversations', page ?? 1, limit ?? 20, type],
    queryFn: () => listConversations({ page, limit, type }),
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
  const { page, limit } = params;
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages', page ?? 1, limit ?? 50],
    queryFn: () => getMessages(conversationId, { page, limit }),
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
  });
}

/**
 * Hook to archive a conversation
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook to unarchive a conversation
 */
export function useUnarchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => unarchiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook to delete a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
