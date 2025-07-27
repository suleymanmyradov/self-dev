import { BarChart3, ChevronRight, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function GoalCard() {
    return (
        <Card className="border-b border-x-0 rounded-none first:border-t-0 last:border-b-0 px-0">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Your Goals
                    </CardTitle>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Track your progress</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">Read 20 books this year</span>
                            <span className="text-sm text-muted-foreground">8/20</span>
                        </div>
                        <Progress value={40} className="h-2" />
                        <p className="mt-1 text-xs text-primary">Youre 20% ahead of schedule!</p>
                    </div>
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">Exercise 3x per week</span>
                            <span className="text-sm text-muted-foreground">2/3 this week</span>
                        </div>
                        <Progress value={66} className="h-2" />
                    </div>
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">Learn Spanish</span>
                            <span className="text-sm text-muted-foreground">Level 2/5</span>
                        </div>
                        <Progress value={40} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                View detailed analytics
                            </span>
                        </div>
                        <span className="text-xs text-primary">Add new goal</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
