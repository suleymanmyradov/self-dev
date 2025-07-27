'use client';

import { Hash, MessageSquare, User, FileText } from 'lucide-react';

const searchResults = [
    {
        id: '1',
        type: 'user',
        icon: User,
        title: 'Growth Mindset Coach',
        subtitle: '@growthmindset',
        description: 'Personal development and mindset coaching',
    },
    {
        id: '2',
        type: 'topic',
        icon: Hash,
        title: 'Morning Routines',
        subtitle: 'Topic',
        description: 'Trending discussions about morning habits',
    },
    {
        id: '3',
        type: 'post',
        icon: MessageSquare,
        title: '5 Habits That Changed My Life',
        subtitle: 'by @productivity_guru',
        description: 'A comprehensive guide to building lasting habits...',
    },
    {
        id: '4',
        type: 'article',
        icon: FileText,
        title: 'The Science of Goal Setting',
        subtitle: 'Article',
        description: 'Research-backed strategies for achieving your goals',
    },
];

export function SearchResults() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                {searchResults.map(result => {
                    const Icon = result.icon;
                    return (
                        <button
                            key={result.id}
                            className="flex items-start gap-3 w-full text-left border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">{result.title}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                    {result.subtitle}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {result.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
