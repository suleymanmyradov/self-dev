import api from './axios-client';
import {
  ConversationsResponseSchema,
  ConversationResponseSchema,
  MessagesResponseSchema,
  StartConversationRequestSchema,
  SendMessageRequestSchema,
  MessageResponseSchema,
} from '@/lib/validation';
import type {
  Message,
  ConversationsResponse,
  ConversationResponse,
  MessagesResponse,
  StartConversationRequest,
  SendMessageRequest,
  ListConversationsParams,
  PageParams,
} from './types';

const ENDPOINTS = {
  CONVERSATIONS: '/conversations',
  CONVERSATION: (id: string) => `/conversations/${encodeURIComponent(id)}`,
  CONVERSATION_MESSAGES: (id: string) => `/conversations/${encodeURIComponent(id)}/messages`,
};

/**
 * List conversations with pagination
 */
export async function listConversations(params: ListConversationsParams = { page: 1, limit: 20 }): Promise<ConversationsResponse> {
  const response = await api.get<unknown>(ENDPOINTS.CONVERSATIONS, params);
  return ConversationsResponseSchema.parse(response);
}

/**
 * Start a new conversation
 */
export async function startConversation(data: StartConversationRequest): Promise<ConversationResponse> {
  const validated = StartConversationRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.CONVERSATIONS, validated);
  return ConversationResponseSchema.parse(response);
}

/**
 * Get a conversation by ID
 */
export async function getConversation(id: string): Promise<ConversationResponse> {
  const response = await api.get<unknown>(ENDPOINTS.CONVERSATION(id));
  return ConversationResponseSchema.parse(response);
}

/**
 * Get conversation messages
 */
export async function getMessages(id: string, params: PageParams = { page: 1, limit: 50 }): Promise<MessagesResponse> {
  const response = await api.get<unknown>(ENDPOINTS.CONVERSATION_MESSAGES(id), params);
  return MessagesResponseSchema.parse(response);
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(id: string, data: SendMessageRequest): Promise<Message> {
  const validated = SendMessageRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.CONVERSATION_MESSAGES(id), validated);
  const parsed = MessageResponseSchema.parse(response);
  return parsed.data;
}
