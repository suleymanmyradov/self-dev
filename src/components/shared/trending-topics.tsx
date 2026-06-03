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
        <div className="space-y-3">
            {topics.map((topic, i) => (
                <button key={i} className="w-full text-left rounded-lg border border-border/50 bg-card/60 p-3 transition-colors hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2">
                    <div className="flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                        <span>{topic.category}</span>
                        <span>•</span>
                        <span>Trending</span>
                    </div>
                    <p className="mt-1 font-medium leading-snug text-foreground">{topic.title}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{topic.posts}</span>
                        {i === 0 && (
                            <>
                                <ChevronUp className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">12%</span>
                            </>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}
