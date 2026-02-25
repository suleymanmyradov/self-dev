"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/ai-conversation/thread";
import { ThreadList } from "@/components/ai-conversation/thread-list";

export const Assistant = () => {
  const runtime = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full">
        <div className="w-[220px] shrink-0 border-r border-border/40 overflow-y-auto p-3">
          <ThreadList />
        </div>
        <div className="flex-1 min-w-0">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
};
