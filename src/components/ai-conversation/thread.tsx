import { ThreadPrimitive } from "@assistant-ui/react";
import type { FC } from "react";

import { Composer } from "@/components/ai-conversation/composer";
import {
  AssistantMessage,
  EditComposer,
  UserMessage,
} from "@/components/ai-conversation/message";
import { ThreadWelcome } from "@/components/ai-conversation/thread-welcome";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

export const Thread: FC = () => {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <ThreadPrimitive.Root
          className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
          style={{
            ["--thread-max-width" as string]: "44rem",
          }}
        >
          <ThreadPrimitive.Viewport className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll px-4">
            <ThreadWelcome />

            <ThreadPrimitive.Messages
              components={{
                UserMessage,
                EditComposer,
                AssistantMessage,
              }}
            />
            <ThreadPrimitive.If empty={false}>
              <div className="aui-thread-viewport-spacer min-h-8 grow" />
            </ThreadPrimitive.If>
            <Composer />
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
      </MotionConfig>
    </LazyMotion>
  );
};
