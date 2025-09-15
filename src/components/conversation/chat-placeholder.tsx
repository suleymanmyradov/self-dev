'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatPlaceholderProps {
    type: 'coach' | 'therapist';
}

export function ChatPlaceholder({ type }: ChatPlaceholderProps) {
    const title = type === 'coach' ? 'AI Coach' : 'AI Therapist';
    const description =
        type === 'coach'
            ? 'Get personalized coaching to achieve your goals and build better habits.'
            : 'Receive supportive guidance for your mental health and emotional well-being.';

    return (
        <div className="h-full flex items-center justify-center p-8">
            <Card className="max-w-md">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Conversation
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
