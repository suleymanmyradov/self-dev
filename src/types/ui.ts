/**
 * UI-only types (not from API)
 */

// UI-only type for content display
export interface ContentPost {
  id: string;
  title: string;
  excerpt: string;
  category: 'health' | 'psychology' | 'productivity' | 'mindfulness';
  readTime: number;
  image: string;
}

// UI-only type for mock conversation display
export interface UIConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  type: 'coach' | 'therapist';
}
