'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useUI } from '@/store/uiStore';

const mockNotifications = [
    {
        id: '1',
        title: 'Daily Habit Reminder',
        message: "Don't forget to complete your morning meditation!",
        time: '2 hours ago',
        unread: true,
    },
    {
        id: '2',
        title: 'AI Coach Session',
        message: 'Your weekly goal review is ready.',
        time: '1 day ago',
        unread: false,
    },
    {
        id: '3',
        title: 'New Content Available',
        message: 'Check out our latest article on stress management.',
        time: '2 days ago',
        unread: false,
    },
];

export function NotificationDrawer() {
    const { isRightPanelOpen, rightPanelType, closeRightPanel } = useUI();

    return (
        <Sheet
            open={isRightPanelOpen && rightPanelType === 'notifications'}
            onOpenChange={closeRightPanel}
        >
            <SheetContent side="right" className="w-80">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {mockNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                                notification.unread
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{notification.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {notification.time}
                                    </p>
                                </div>
                                {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <Button variant="outline" className="w-full">
                        Mark All as Read
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
