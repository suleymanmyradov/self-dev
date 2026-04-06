import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { ArrowUpIcon, Square } from "lucide-react";
import type { FC } from "react";

import {
  ComposerAddAttachment,
  ComposerAttachments,
} from "@/components/ai-conversation/attachment";
import { TooltipIconButton } from "@/components/ai-conversation/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { ThreadWelcomeSuggestions } from "./thread-welcome";

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowUpIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

export const Composer: FC = () => {
  return (
    <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 overflow-visible rounded-t-2xl bg-gradient-to-t from-background via-background to-transparent pb-4 md:pb-6">
      <ThreadScrollToBottom />
      <ThreadPrimitive.Empty>
        <ThreadWelcomeSuggestions />
      </ThreadPrimitive.Empty>
      <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col rounded-2xl border border-border/50 bg-muted/50 backdrop-blur-sm px-1 pt-2 shadow-sm transition-all focus-within:border-calm/30 focus-within:bg-muted">
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Share your thoughts..."
          className="aui-composer-input mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground/60 focus:outline-none"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative mx-1 mt-2 mb-2 flex items-center justify-between">
      <ComposerAddAttachment />

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="calm"
            size="icon"
            className="aui-composer-send size-[34px] rounded-full p-1"
            aria-label="Send message"
          >
            <ArrowUpIcon className="aui-composer-send-icon size-5" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="aui-composer-cancel size-[34px] rounded-full border border-border/50 hover:bg-muted"
            aria-label="Stop generating"
          >
            <Square className="aui-composer-cancel-icon size-3.5 fill-foreground" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};
