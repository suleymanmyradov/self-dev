import type { Conversation, Habit, TodoItem, ContentPost, ChatMessage } from './types-data';

export const mockConversations: Conversation[] = [
    {
        id: '1',
        title: 'Morning Motivation Session',
        lastMessage: 'Great job on setting those goals! Remember to take it one step at a time.',
        timestamp: new Date('2024-01-15T09:30:00'),
        type: 'coach',
    },
    {
        id: '2',
        title: 'Stress Management Discussion',
        lastMessage: "It sounds like you're making real progress with your breathing exercises.",
        timestamp: new Date('2024-01-14T14:20:00'),
        type: 'therapist',
    },
    {
        id: '3',
        title: 'Weekly Goal Review',
        lastMessage: "Let's review how you did with your weekly goals.",
        timestamp: new Date('2024-01-13T16:45:00'),
        type: 'coach',
    },
];

export const mockHabits: Habit[] = [
    {
        id: '1',
        name: 'Morning Meditation',
        description: '10 minutes of mindfulness meditation',
        streak: 7,
        completed: true,
        category: 'Mindfulness',
    },
    {
        id: '2',
        name: 'Daily Exercise',
        description: '30 minutes of physical activity',
        streak: 3,
        completed: false,
        category: 'Health',
    },
    {
        id: '3',
        name: 'Read for 20 minutes',
        description: 'Read personal development books',
        streak: 12,
        completed: true,
        category: 'Learning',
    },
];

export const mockTodos: TodoItem[] = [
    {
        id: '1',
        title: 'Complete weekly reflection',
        description: "Write about this week's progress and challenges",
        completed: false,
        priority: 'high',
        dueDate: new Date('2024-01-16'),
    },
    {
        id: '2',
        title: 'Schedule therapy session',
        description: 'Book next appointment with therapist',
        completed: false,
        priority: 'medium',
    },
    {
        id: '3',
        title: 'Update habit tracker',
        description: "Log today's habit completions",
        completed: true,
        priority: 'low',
    },
];

export const mockContentPosts: ContentPost[] = [
    {
        id: '1',
        title: 'The Science of Building Better Habits',
        excerpt:
            'Discover evidence-based strategies for creating lasting behavioral change through small, consistent actions.',
        category: 'psychology',
        readTime: 8,
        image: '/placeholder.svg?height=200&width=300',
    },
    {
        id: '2',
        title: 'Mindful Breathing Techniques for Stress Relief',
        excerpt:
            'Learn simple yet powerful breathing exercises that can help you manage stress and anxiety in daily life.',
        category: 'mindfulness',
        readTime: 5,
        image: '/placeholder.svg?height=200&width=300',
    },
    {
        id: '3',
        title: 'Optimizing Your Sleep for Better Mental Health',
        excerpt:
            'Explore the connection between quality sleep and emotional well-being, plus practical tips for better rest.',
        category: 'health',
        readTime: 12,
        image: '/placeholder.svg?height=200&width=300',
    },
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
    '1': [
        {
            id: '1',
            content: "Good morning! I'm ready to work on my goals today.",
            role: 'user',
            timestamp: new Date('2024-01-15T09:00:00'),
        },
        {
            id: '2',
            content:
                'Good morning! I love your enthusiasm. What specific goals would you like to focus on today?',
            role: 'assistant',
            timestamp: new Date('2024-01-15T09:01:00'),
        },
        {
            id: '3',
            content:
                'I want to establish a better morning routine and be more consistent with my exercise.',
            role: 'user',
            timestamp: new Date('2024-01-15T09:02:00'),
        },
        {
            id: '4',
            content:
                "Great job on setting those goals! Remember to take it one step at a time. Let's start by breaking down your morning routine into small, manageable steps.",
            role: 'assistant',
            timestamp: new Date('2024-01-15T09:03:00'),
        },
    ],
    '2': [
        {
            id: '1',
            content: "I've been feeling overwhelmed lately with work stress.",
            role: 'user',
            timestamp: new Date('2024-01-14T14:00:00'),
        },
        {
            id: '2',
            content:
                "I hear you, and it's completely understandable to feel overwhelmed. Can you tell me more about what specific aspects of work are causing you the most stress?",
            role: 'assistant',
            timestamp: new Date('2024-01-14T14:01:00'),
        },
        {
            id: '3',
            content: "It's mainly the deadlines and feeling like I can't keep up with everything.",
            role: 'user',
            timestamp: new Date('2024-01-14T14:05:00'),
        },
        {
            id: '4',
            content:
                "It sounds like you're making real progress with your breathing exercises. Those coping strategies we discussed can really help when you're feeling that pressure.",
            role: 'assistant',
            timestamp: new Date('2024-01-14T14:20:00'),
        },
    ],
};
