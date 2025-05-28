import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoalCard } from '@/components/home/goal-card';
import { HabitTracker } from '@/components/home/habit-tracker';
import { FeedPost } from '@/components/home/feed-post';

export default function HomePage() {
    return (
        <>
            <div className="sticky top-16 z-10 border-b bg-background/95 backdrop-blur">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold">Home</h1>
                    <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <Tabs defaultValue="for-you" className="w-full p-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="for-you">For You</TabsTrigger>
                        <TabsTrigger value="following">Following</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="p-4 max-w-[600px] mx-auto w-full">
                <div className="mb-4 flex items-start gap-3">
                    <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@username" />
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="mb-2 rounded-full border bg-muted/40 px-4 py-2 text-muted-foreground">
                            Whats on your mind today?
                        </div>
                        <div className="flex justify-between">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                    Goals
                                </Button>
                                <Button variant="ghost" size="sm">
                                    Habits
                                </Button>
                                <Button variant="ghost" size="sm">
                                    Mood
                                </Button>
                            </div>
                            <Button size="sm">Share</Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <GoalCard />
                    <HabitTracker />
                    <FeedPost
                        user={{
                            name: 'Tim Urban',
                            username: '@waitbutwhy',
                            avatar: '/placeholder.svg?height=40&width=40',
                        }}
                        content="Seems like a good time for an update on a graph from my 2015 post on AI."
                        image="/placeholder.svg?height=300&width=500"
                        time="11h"
                        likes={245}
                        comments={32}
                        reposts={78}
                    />
                    <FeedPost
                        user={{
                            name: 'Growth Mindset',
                            username: '@growthmindset',
                            avatar: '/placeholder.svg?height=40&width=40',
                        }}
                        content="The difference between a fixed mindset and a growth mindset is how you approach challenges and view failure. Embrace the journey!"
                        time="3h"
                        likes={189}
                        comments={24}
                        reposts={56}
                    />
                    <FeedPost
                        user={{
                            name: 'Daily Habits',
                            username: '@dailyhabits',
                            avatar: '/placeholder.svg?height=40&width=40',
                        }}
                        content="Small habits compound over time. 1% better every day means you'll be 37 times better by the end of the year."
                        time="5h"
                        likes={312}
                        comments={41}
                        reposts={98}
                    />
                </div>
            </div>
        </>
    );
}
