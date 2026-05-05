import { redirect } from 'next/navigation';

export default async function AITherapistConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    redirect(`/ai-coach/${conversationId}`);
}
