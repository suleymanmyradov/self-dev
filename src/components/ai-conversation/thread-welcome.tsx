import { ThreadPrimitive } from "@assistant-ui/react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { withDelay, fadeInUp, fadeInUpLarge } from './animations';
import * as m from "motion/react-m";

export const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
        <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
          <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-8">
            <m.div
              {...fadeInUp}
              className="aui-thread-welcome-message-motion-1 text-2xl font-semibold text-calm"
            >
              Hello there!
            </m.div>
            <m.div
              {...withDelay(fadeInUp, 0.1)}
              className="aui-thread-welcome-message-motion-2 text-lg text-muted-foreground/80 mt-1"
            >
              I'm here to support your growth journey. How can I help?
            </m.div>
          </div>
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const SUGGESTED_ACTIONS = [
  {
    title: "Help me build a habit",
    label: "for daily mindfulness",
    action: "Help me build a daily mindfulness habit",
  },
  {
    title: "Set a meaningful goal",
    label: "for personal growth",
    action: "Help me set a meaningful personal growth goal",
  },
  {
    title: "Overcome procrastination",
    label: "with practical strategies",
    action: "Give me practical strategies to overcome procrastination",
  },
  {
    title: "Create a routine",
    label: "for better mornings",
    action: "Help me create a morning routine for better productivity",
  },
] as const;

export const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions grid w-full gap-2 @md:grid-cols-2">
      {SUGGESTED_ACTIONS.map((suggestedAction, index) => (
        <m.div
          {...withDelay(fadeInUpLarge, 0.05 * index)}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="aui-thread-welcome-suggestion-display [&:nth-child(n+3)]:hidden @md:[&:nth-child(n+3)]:block"
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestedAction.action}
            method="replace"
            autoSend
            asChild
          >
            <Button
              variant="ghost"
              className="aui-thread-welcome-suggestion h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-5 py-4 text-left text-sm transition-all hover:border-calm/30 hover:bg-calm-soft/20 @md:flex-col"
              aria-label={suggestedAction.action}
            >
              <span className="aui-thread-welcome-suggestion-text-1 font-medium text-foreground">
                {suggestedAction.title}
              </span>
              <span className="aui-thread-welcome-suggestion-text-2 text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};
