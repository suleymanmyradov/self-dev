'use client';

// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useUI } from '@/store/uiStore';
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';

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
];

export function NotificationModal() {
    const { isRightPanelOpen, rightPanelType, closeRightPanel } = useUI();

    return (
        <Dialog
            open={isRightPanelOpen && rightPanelType === 'notifications'}
            onOpenChange={closeRightPanel}
        >
            <DialogContent className="max-w-sm">
                <DialogTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                </DialogTitle>

                <div className="space-y-3">
                    {mockNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                                notification.unread
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                        </div>
                    ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                    Mark All as Read
                </Button>
            </DialogContent>
        </Dialog>
    );
}
