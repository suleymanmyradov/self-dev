"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
  type AppendMessage,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { Thread } from "@/components/ai-conversation/thread";
import { ThreadList } from "@/components/ai-conversation/thread-list";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { useBillingOverview } from "@/hooks";
import { streamPersonalizedCoaching } from "@/api/personalization";
import { startConversation, getMessages } from "@/api/conversations";

interface CoachingMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "complete" | "running";
}

let messageCounter = 0;
function generateId() {
  return `msg-${++messageCounter}`;
}

function extractText(message: AppendMessage): string {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  return "";
}

export const Assistant = ({ conversationId }: { conversationId?: string }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | undefined
  >(conversationId);
  const abortRef = useRef<AbortController | null>(null);
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";

  // Load conversation history when a conversationId is provided
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setCurrentConversationId(undefined);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const resp = await getMessages(conversationId);
        if (cancelled) return;
        const loaded: CoachingMessage[] = resp.data.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          status: "complete",
        }));
        setMessages(loaded);
        setCurrentConversationId(conversationId);
      } catch (err) {
        console.error("Failed to load conversation:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const convertMessage = useCallback(
    (msg: CoachingMessage): ThreadMessageLike => ({
      role: msg.role,
      content: msg.content,
      id: msg.id,
      status:
        msg.status === "running"
          ? { type: "running" }
          : { type: "complete", reason: "stop" },
    }),
    []
  );

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const userText = extractText(message);
      const userMsg: CoachingMessage = {
        id: generateId(),
        role: "user",
        content: userText,
        status: "complete",
      };
      const assistantId = generateId();
      const assistantMsg: CoachingMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "running",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsRunning(true);

      // If we don't have a conversation yet, create one with the initial message.
      let convId = currentConversationId;
      if (!convId) {
        try {
          const resp = await startConversation({
            type: "coach",
            initialMessage: userText,
          });
          convId = resp.data.id;
          setCurrentConversationId(convId);
          // Replace the temp URL with the conversation URL so reloads work.
          router.replace(`/ai-coach/${convId}`);
        } catch (err) {
          console.error("Failed to create conversation:", err);
          // Continue without persistence — the stream will still work.
        }
      }

      abortRef.current = streamPersonalizedCoaching(
        {
          userMessage: userText,
          conversationId: convId,
        },
        {
          onDelta: (text) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + text }
                  : m
              )
            );
          },
          onComplete: (fullResponse) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: fullResponse, status: "complete" as const }
                  : m
              )
            );
            setIsRunning(false);
            abortRef.current = null;
          },
          onError: (errorMessage) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content:
                        m.content ||
                        `Sorry, I encountered an error: ${errorMessage}`,
                      status: "complete" as const,
                    }
                  : m
              )
            );
            setIsRunning(false);
            abortRef.current = null;
          },
        }
      );
    },
    [currentConversationId, router]
  );

  const onCancel = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsRunning(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.status === "running" ? { ...m, status: "complete" as const } : m
      )
    );
  }, []);

  const runtime = useExternalStoreRuntime<CoachingMessage>({
    messages,
    isRunning,
    convertMessage,
    onNew,
    onCancel,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full relative">
        {/* Ambient calming background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-ambient-calm opacity-20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-ambient-growth opacity-15 blur-3xl" />
        </div>

        {/* Sidebar */}
        <div className="relative w-[220px] shrink-0 border-r border-border/40 overflow-y-auto p-3 bg-background/50 backdrop-blur-sm">
          <ThreadList />
          {/* Personalized AI upgrade prompt for free users */}
          {!isPro && (
            <div className="mt-4">
              <UpgradePrompt
                surface="assistant_personalization"
                trigger="personalized_ai"
                title="Deeper coaching memory"
                description="Upgrade to Pro for personalized AI coaching that remembers your patterns."
                compact
                isPro={isPro}
              />
            </div>
          )}
        </div>

        {/* Main chat area */}
        <div className="relative flex-1 min-w-0">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
};
