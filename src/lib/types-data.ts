export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

export interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    type: 'coach' | 'therapist';
}

export interface Habit {
    id: string;
    name: string;
    description: string;
    streak: number;
    completed: boolean;
    category: string;
}

export interface TodoItem {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
}

export interface ContentPost {
    id: string;
    title: string;
    excerpt: string;
    category: 'health' | 'psychology' | 'productivity' | 'mindfulness';
    readTime: number;
    image: string;
}
