import type { UIConversation, ContentPost } from '@/types/ui';

export const mockConversations: UIConversation[] = [
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
