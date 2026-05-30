import type { Metadata } from 'next';
import { Assistant } from '@/components/ai-coach/assistant';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}): Promise<Metadata> {
    return {
        title: 'AI Coach | Growth',
        description: 'Your AI accountability coaching session.',
    };
}

export default async function AICoachConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    return <Assistant key={conversationId} />;
}
