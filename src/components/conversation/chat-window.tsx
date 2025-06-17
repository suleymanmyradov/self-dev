'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Menu } from 'lucide-react';
import { mockChatMessages } from '@/lib/mock-data';
import type { ChatMessage } from '@/lib/types-data';
import { useRouter } from 'next/navigation';
import { useUI } from '@/store/uiStore';

interface ChatWindowProps {
    type: 'coach' | 'therapist';
    conversationId: string;
}

export function ChatWindow({ type, conversationId }: ChatWindowProps) {
    const { isMobile, setShowChatHistory } = useUI();
    const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages[conversationId] || []);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: newMessage,
            role: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: `Thank you for sharing that. As your ${type}, I want to help you work through this. Can you tell me more about what you're experiencing?`,
                role: 'assistant',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    const handleBack = () => {
        if (isMobile) {
            router.back();
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <h2 className="font-semibold text-gray-900">
                        {type === 'coach' ? 'AI Coach' : 'AI Therapist'}
                    </h2>
                </div>
                {isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setShowChatHistory(true)}>
                        <Menu className="h-4 w-4" />
                    </Button>
                )}
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                            }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p
                                className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}
                            >
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
