'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { mockContentPosts } from '@/lib/mock-data';

type Category = 'health' | 'psychology' | 'productivity' | 'mindfulness';

const categoryColors: Record<Category, string> = {
    health: 'bg-[hsl(142,76%,91%)] text-[hsl(142,71%,29%)]', // green
    psychology: 'bg-[hsl(271,91%,96%)] text-[hsl(271,60%,40%)]', // purple
    productivity: 'bg-[hsl(221,91%,96%)] text-[hsl(221,70%,45%)]', // blue
    mindfulness: 'bg-[hsl(34,100%,91%)] text-[hsl(34,80%,35%)]', // orange
};

export function ContentFeed() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to Self Dev AI</h1>
                <p className="text-muted-foreground">
                    Discover insights and tools for your personal development journey.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Current Streak</p>
                                <p className="text-xl font-bold text-foreground">7 days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Habits Completed</p>
                                <p className="text-xl font-bold text-foreground">2/3</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[hsl(271,91%,96%)] rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-[hsl(271,60%,40%)]" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Sessions This Week</p>
                                <p className="text-xl font-bold text-foreground">3</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Posts */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Latest Content</h2>

                <div className="grid gap-6">
                    {mockContentPosts.map(post => (
                        <Card
                            key={post.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="md:flex">
                                <div className="md:w-48 md:flex-shrink-0">
                                    <Image
                                        src={post.image || '/placeholder.svg'}
                                        alt={post.title}
                                        width={300}
                                        height={200}
                                        className="w-full h-48 md:h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <CardHeader>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={categoryColors[post.category]}>
                                                {post.category}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {post.readTime} min read
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl text-foreground">
                                            {post.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{post.excerpt}</p>
                                    </CardContent>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
