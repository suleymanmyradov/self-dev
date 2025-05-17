import { Heart, MessageCircle, Repeat, Share } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface FeedPostProps {
    user: {
        name: string;
        username: string;
        avatar: string;
    };
    content: string;
    image?: string;
    time: string;
    likes: number;
    comments: number;
    reposts: number;
}

export function FeedPost({ user, content, image, time, likes, comments, reposts }: FeedPostProps) {
    return (
        <Card className="border-b border-x-0 rounded-none first:border-t-0 last:border-b-0 px-0">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                <Avatar>
                    <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-muted-foreground">{user.username}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{time}</span>
                    </div>
                    <p className="mt-1">{content}</p>
                </div>
            </CardHeader>
            {image && (
                <CardContent className="pb-2 pt-0">
                    <div className="overflow-hidden rounded-xl">
                        <img
                            src={image || '/placeholder.svg'}
                            alt="Post image"
                            className="w-full object-cover"
                        />
                    </div>
                </CardContent>
            )}
            <CardFooter className="flex justify-between px-4 py-2">
                <Button variant="ghost" size="icon">
                    <MessageCircle className="h-5 w-5" />
                    <span className="ml-1 text-xs">{comments}</span>
                </Button>
                <Button variant="ghost" size="icon">
                    <Repeat className="h-5 w-5" />
                    <span className="ml-1 text-xs">{reposts}</span>
                </Button>
                <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                    <span className="ml-1 text-xs">{likes}</span>
                </Button>
                <Button variant="ghost" size="icon">
                    <Share className="h-5 w-5" />
                </Button>
            </CardFooter>
        </Card>
    );
}
