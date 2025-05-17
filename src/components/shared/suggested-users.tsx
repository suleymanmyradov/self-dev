import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function SuggestedUsers() {
    const users = [
        {
            name: 'Robert Floo',
            username: '@RobertFlooSVK',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            name: 'Mit',
            username: '@mitlimen',
            avatar: '/placeholder.svg?height=40&width=40',
        },
        {
            name: 'Marc Andreessen',
            username: '@pmarca',
            avatar: '/placeholder.svg?height=40&width=40',
        },
    ];

    return (
        <div className="space-y-4">
            {users.map((user, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.username}</div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                        Follow
                    </Button>
                </div>
            ))}
        </div>
    );
}
