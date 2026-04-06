"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/ai-conversation/thread";
import { ThreadList } from "@/components/ai-conversation/thread-list";

export const Assistant = () => {
  const runtime = useChatRuntime();

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
        </div>

        {/* Main chat area */}
        <div className="relative flex-1 min-w-0">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
};
