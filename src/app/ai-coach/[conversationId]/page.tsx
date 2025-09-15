import { ChatWindow } from '@/components/conversation/chat-window';

export default function AICoachConversationPage({
    params,
}: {
    params: { conversationId: string };
}) {
    return <ChatWindow type="coach" conversationId={params.conversationId} />;
}
