import { ChevronUp } from 'lucide-react';

export function TrendingTopics() {
    const topics = [
        {
            category: 'Self-Development',
            title: 'Mindfulness Techniques',
            posts: '3,256 posts',
        },
        {
            category: 'Psychology',
            title: 'Cognitive Behavioral Therapy',
            posts: '2,845 posts',
        },
        {
            category: 'Productivity',
            title: 'Time Blocking Method',
            posts: '1,932 posts',
        },
        {
            category: 'Wellness',
            title: 'Morning Routines',
            posts: '1,756 posts',
        },
    ];

    return (
        <div className="space-y-4">
            {topics.map((topic, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{topic.category}</span>
                        <span>·</span>
                        <span>Trending</span>
                    </div>
                    <p className="font-semibold">{topic.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{topic.posts}</span>
                        {i === 0 && (
                            <>
                                <ChevronUp className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">12%</span>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
