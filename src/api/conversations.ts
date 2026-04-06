import api from './client';
import type {
  Conversation,
  ConversationDetail,
  Message,
  ConversationsResponse,
  ConversationResponse,
  ConversationDetailResponse,
  MessagesResponse,
  StartConversationRequest,
  SendMessageRequest,
  ListConversationsParams,
  PageParams,
} from './types';

const ENDPOINTS = {
  CONVERSATIONS: '/conversations',
  CONVERSATION: (id: string) => `/conversations/${id}`,
  CONVERSATION_MESSAGES: (id: string) => `/conversations/${id}/messages`,
};

/**
 * List conversations with pagination
 */
export async function listConversations(params: ListConversationsParams = { page: 1, limit: 20 }): Promise<ConversationsResponse> {
  return api.get<ConversationsResponse>(ENDPOINTS.CONVERSATIONS, params);
}

/**
 * Start a new conversation
 */
export async function startConversation(data: StartConversationRequest): Promise<ConversationResponse> {
  return api.post<ConversationResponse>(ENDPOINTS.CONVERSATIONS, data);
}

/**
 * Get a conversation by ID
 */
export async function getConversation(id: string): Promise<ConversationResponse> {
  return api.get<ConversationResponse>(ENDPOINTS.CONVERSATION(id));
}

/**
 * Get conversation messages
 */
export async function getMessages(id: string, params: PageParams = { page: 1, limit: 50 }): Promise<MessagesResponse> {
  return api.get<MessagesResponse>(ENDPOINTS.CONVERSATION_MESSAGES(id), params);
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(id: string, data: SendMessageRequest): Promise<Message> {
  return api.post<Message>(ENDPOINTS.CONVERSATION_MESSAGES(id), data);
}
