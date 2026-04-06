import { Assistant } from '@/app/assistant';

export default async function AITherapistConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    return <Assistant key={conversationId} />;
}
