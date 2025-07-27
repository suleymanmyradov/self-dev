'use client';

import { Heart, MessageSquare, Users, Zap } from 'lucide-react';

const notifications = [
    {
        id: '1',
        type: 'achievement',
        icon: Zap,
        title: 'Goal Completed!',
        message: "You've completed your daily reading goal",
        timestamp: '5 min ago',
        unread: true,
    },
    {
        id: '2',
        type: 'social',
        icon: Heart,
        title: 'New Like',
        message: 'Someone liked your progress update',
        timestamp: '1 hour ago',
        unread: true,
    },
    {
        id: '3',
        type: 'message',
        icon: MessageSquare,
        title: 'Coach Message',
        message: 'Your AI coach has new suggestions',
        timestamp: '2 hours ago',
        unread: false,
    },
    {
        id: '4',
        type: 'community',
        icon: Users,
        title: 'Community Update',
        message: 'New discussion in Growth Mindset group',
        timestamp: '1 day ago',
        unread: false,
    },
];

export function NotificationsList() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                {notifications.map(notification => {
                    const Icon = notification.icon;
                    return (
                        <button
                            key={notification.id}
                            className="flex items-start gap-3 w-full text-left border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">
                                        {notification.title}
                                    </span>
                                    {notification.unread && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                    {notification.message}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                    {notification.timestamp}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
