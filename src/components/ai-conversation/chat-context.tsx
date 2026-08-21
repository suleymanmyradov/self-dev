'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from 'react';
import {
    useConversationMessages,
    type CoachingMessage,
} from '@/components/ai-coach/use-conversation-messages';
import {
    ATTACHMENT_ACCEPT,
    createAttachment,
    isPDF,
    readAttachmentText,
    revokeAttachmentPreview,
    type ChatAttachment,
} from '@/components/ai-coach/attachment-adapter';

type ConversationMessagesState = ReturnType<typeof useConversationMessages>;

export interface ChatThreadContextValue {
    messages: CoachingMessage[];
    setMessages: Dispatch<SetStateAction<CoachingMessage[]>>;
    isRunning: boolean;
    thinkingMessage: string | null;
    isEmpty: boolean;
    currentConversationId: string | undefined;
    setCurrentConversationId: Dispatch<SetStateAction<string | undefined>>;
    retry: (messageId: string) => Promise<void>;
}

export interface ChatComposerContextValue {
    text: string;
    setText: (text: string) => void;
    attachments: ChatAttachment[];
    addAttachment: (file: File) => void;
    removeAttachment: (id: string) => void;
    attachmentAccept: string;
    send: (text?: string) => Promise<void>;
    cancel: () => void;
    editingMessageId: string | null;
    editText: string;
    setEditText: (text: string) => void;
    startEditing: (message: CoachingMessage) => void;
    cancelEditing: () => void;
    updateEditing: () => Promise<void>;
}

type ChatContextValue = ChatThreadContextValue & ChatComposerContextValue;

const ChatContext = createContext<ChatContextValue | null>(null);

function useRequiredChat(): ChatContextValue {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('Chat hooks must be used within ChatProvider');
    }
    return context;
}

export function useChatThread(): ChatThreadContextValue {
    return useRequiredChat();
}

export function useChatComposer(): ChatComposerContextValue {
    return useRequiredChat();
}

export function useChat(): ChatContextValue {
    return useRequiredChat();
}

async function buildMessageText(text: string, attachments: ChatAttachment[]): Promise<string> {
    if (attachments.length === 0) return text;

    const chunks = await Promise.all(
        attachments.map(async attachment => {
            // Images and PDFs are forwarded as base64 multimodal parts; only
            // text documents need their body embedded in the prompt string.
            if (attachment.type === 'image') return '';
            const body = await readAttachmentText(attachment.file);
            if (isPDF(attachment)) return body ? `\n\n${body}` : '';
            const label = 'Attachment';
            return body
                ? `\n\n[${label}: ${attachment.name}]\n${body}`
                : `\n\n[${label}: ${attachment.name}]`;
        }),
    );

    return `${text}${chunks.join('')}`.trim();
}

export function ChatProvider({
    state,
    children,
}: {
    state: ConversationMessagesState;
    children: ReactNode;
}) {
    const {
        messages,
        setMessages,
        isRunning,
        thinkingMessage,
        currentConversationId,
        setCurrentConversationId,
        onNew,
        onCancel,
    } = state;
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const attachmentsRef = useRef(attachments);

    useEffect(() => {
        attachmentsRef.current = attachments;
    }, [attachments]);

    useEffect(() => {
        return () => {
            attachmentsRef.current.forEach(revokeAttachmentPreview);
        };
    }, []);

    const addAttachment = useCallback((file: File) => {
        const attachment = createAttachment(file);
        if (!attachment) return;
        setAttachments(prev => [...prev, attachment]);
    }, []);

    const removeAttachment = useCallback((id: string) => {
        setAttachments(prev => {
            const attachment = prev.find(item => item.id === id);
            if (attachment) revokeAttachmentPreview(attachment);
            return prev.filter(item => item.id !== id);
        });
    }, []);

    const submitMessage = useCallback(
        async (displayText: string, messageAttachments: ChatAttachment[]) => {
            if (isRunning) return;
            const typed = displayText.trim();
            if (!typed && messageAttachments.length === 0) return;

            const apiText = await buildMessageText(typed, messageAttachments);
            await onNew(apiText, {
                displayText: typed,
                attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
            });
        },
        [isRunning, onNew],
    );

    const send = useCallback(
        async (overrideText?: string) => {
            const typed = (overrideText ?? text).trim();
            const pending = attachments;
            if (!typed && pending.length === 0) return;

            setText('');
            setAttachments([]);
            await submitMessage(typed, pending);
        },
        [attachments, submitMessage, text],
    );

    const cancel = useCallback(() => {
        void onCancel();
    }, [onCancel]);

    const retry = useCallback(
        async (messageId: string) => {
            if (isRunning) return;
            const index = messages.findIndex(message => message.id === messageId);
            if (index < 0) return;
            const previousUserMessage = [...messages.slice(0, index)]
                .reverse()
                .find(message => message.role === 'user');
            if (!previousUserMessage) return;
            await onNew(previousUserMessage.content, {
                displayText: previousUserMessage.content,
                attachments: previousUserMessage.attachments,
                regenerateMessageId: messageId,
            });
        },
        [isRunning, messages, onNew],
    );

    const startEditing = useCallback((message: CoachingMessage) => {
        setEditingMessageId(message.id);
        setEditText(message.content);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingMessageId(null);
        setEditText('');
    }, []);

    const updateEditing = useCallback(async () => {
        const nextText = editText.trim();
        if (!editingMessageId || !nextText || isRunning) return;
        setEditingMessageId(null);
        setEditText('');
        await submitMessage(nextText, []);
    }, [editText, editingMessageId, isRunning, submitMessage]);

    const value = useMemo<ChatContextValue>(
        () => ({
            messages,
            setMessages,
            isRunning,
            thinkingMessage,
            isEmpty: messages.length === 0,
            currentConversationId,
            setCurrentConversationId,
            retry,
            text,
            setText,
            attachments,
            addAttachment,
            removeAttachment,
            attachmentAccept: ATTACHMENT_ACCEPT,
            send,
            cancel,
            editingMessageId,
            editText,
            setEditText,
            startEditing,
            cancelEditing,
            updateEditing,
        }),
        [
            addAttachment,
            attachments,
            cancel,
            cancelEditing,
            currentConversationId,
            editText,
            editingMessageId,
            isRunning,
            messages,
            removeAttachment,
            retry,
            send,
            setCurrentConversationId,
            setMessages,
            startEditing,
            text,
            thinkingMessage,
            updateEditing,
        ],
    );

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
