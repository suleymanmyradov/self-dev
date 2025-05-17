import { Check, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function HabitTracker() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const habits = [
        { name: 'Meditation', completed: [true, true, false, true, false, false, false] },
        { name: 'Reading', completed: [true, true, true, true, true, false, false] },
        { name: 'Exercise', completed: [false, true, false, true, false, false, false] },
    ];

    return (
        <Card className="border-b border-x-0 rounded-none first:border-t-0 last:border-b-0 px-0">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Daily Habits</CardTitle>
                    <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Keep your streak going</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <div className="w-24"></div>
                        <div className="flex flex-1 justify-between">
                            {days.map((day, i) => (
                                <div
                                    key={i}
                                    className="flex h-6 w-6 items-center justify-center text-xs font-medium text-muted-foreground"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                    {habits.map((habit, i) => (
                        <div key={i} className="flex justify-between">
                            <div className="w-24 text-sm font-medium">{habit.name}</div>
                            <div className="flex flex-1 justify-between">
                                {habit.completed.map((completed, j) => (
                                    <div
                                        key={j}
                                        className={cn(
                                            'flex h-6 w-6 items-center justify-center rounded-full',
                                            completed
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted',
                                        )}
                                    >
                                        {completed && <Check className="h-3 w-3" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                            Current streak: 5 days
                        </span>
                        <span className="text-xs text-primary">View all habits</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
