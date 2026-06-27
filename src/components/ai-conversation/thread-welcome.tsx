import { ThreadPrimitive } from '@assistant-ui/react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { withDelay, fadeInUp, fadeInUpLarge } from './animations';
import * as m from 'motion/react-m';

export const ThreadWelcome: FC = () => {
    return (
        <ThreadPrimitive.Empty>
            <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
                <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
                    <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-2 py-10 md:px-8">
                        <m.div
                            {...fadeInUp}
                            className="aui-thread-welcome-eyebrow mb-3 w-fit rounded-full bg-calm-soft px-3 py-1.5 text-xs font-medium text-calm"
                        >
                            Personalized coaching
                        </m.div>
                        <m.div
                            {...withDelay(fadeInUp, 0.05)}
                            className="aui-thread-welcome-message-motion-1 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl"
                        >
                            Build habits that feel sustainable.
                        </m.div>
                        <m.div
                            {...withDelay(fadeInUp, 0.12)}
                            className="aui-thread-welcome-message-motion-2 mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base"
                        >
                            Tell me what you&apos;re working toward and I&apos;ll help shape a calm,
                            specific plan with accountability you can keep.
                        </m.div>
                    </div>
                </div>
            </div>
        </ThreadPrimitive.Empty>
    );
};

const SUGGESTED_ACTIONS = [
    {
        title: 'I have a goal in mind',
        label: 'help me turn it into a habit plan',
        action: 'I have a goal I want to work on. Help me turn it into a concrete daily habit plan.',
    },
    {
        title: 'I keep falling off track',
        label: 'help me understand why and reset',
        action: 'I keep starting habits but falling off after a few days. Help me figure out why and build a recovery plan.',
    },
    {
        title: 'Review my week',
        label: 'what went well and what to adjust',
        action: "Let's do a quick weekly review. I want to look at what I completed, what I missed, and adjust my plan.",
    },
    {
        title: 'I need accountability',
        label: 'check in on my current goals',
        action: 'Can you check in on my current goals and habits? I want to stay accountable.',
    },
] as const;

export const ThreadWelcomeSuggestions: FC = () => {
    return (
        <div className="aui-thread-welcome-suggestions grid w-full gap-3 @md:grid-cols-2">
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
                            className="aui-thread-welcome-suggestion hover-lift h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-xl border border-border/60 bg-card px-5 py-4 text-left text-sm shadow-sm transition-all hover:border-calm/35 hover:bg-calm-soft/20 @md:flex-col"
                            aria-label={suggestedAction.action}
                        >
                            <span className="aui-thread-welcome-suggestion-text-1 font-semibold text-foreground">
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
