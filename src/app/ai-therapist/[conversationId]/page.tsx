import { Assistant } from '@/app/assistant';

export default async function TherapistConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    await params; // conversationId currently unused; Assistant manages its own threads
    return <Assistant />;
}
