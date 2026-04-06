import { Assistant } from '@/app/assistant';

export default async function AICoachConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    return <Assistant key={conversationId} />;
}
