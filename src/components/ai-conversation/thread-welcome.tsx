'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { useChatComposer } from '@/components/ai-conversation/chat-context';
import { withDelay, fadeInUp, fadeInUpLarge } from './animations';
import * as m from 'motion/react-m';

export const ThreadWelcome: FC = () => {
    return (
        <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
            <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
                <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-2 py-10 md:px-8">
                    <m.div
                        {...fadeInUp}
                        className="aui-thread-welcome-eyebrow mb-3 w-fit rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                        Personalized coaching
                    </m.div>
                    <m.div
                        {...withDelay(fadeInUp, 0.05)}
                        className="aui-thread-welcome-message-motion-1 font-display text-3xl font-normal leading-tight tracking-tight text-foreground md:text-4xl"
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
    );
};

const SUGGESTED_ACTIONS = [
    {
        title: 'Plan my Thursday',
        action: 'Help me plan my Thursday — what habits should I prioritize and when should I do them?',
    },
    {
        title: 'Why do I quit at week three?',
        action: 'I keep quitting my habits at around week three. Help me understand why and what I can do about it.',
    },
    {
        title: 'Review my week',
        action: "Let's review my week. What went well, what slipped, and what should I adjust for next week?",
    },
] as const;

export const ThreadWelcomeSuggestions: FC = () => {
    const { send } = useChatComposer();

    return (
        <div className="aui-thread-welcome-suggestions flex w-full flex-wrap gap-2">
            {SUGGESTED_ACTIONS.map((suggestedAction, index) => (
                <m.div
                    {...withDelay(fadeInUpLarge, 0.05 * index)}
                    key={`suggested-action-${suggestedAction.title}-${index}`}
                    className="aui-thread-welcome-suggestion-display"
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void send(suggestedAction.action)}
                        className="aui-thread-welcome-suggestion h-8 rounded-full border-border bg-background px-4 text-xs font-normal text-foreground transition-[color,border-color,background-color] hover:bg-secondary hover:text-foreground"
                        aria-label={suggestedAction.action}
                    >
                        {suggestedAction.title}
                    </Button>
                </m.div>
            ))}
        </div>
    );
};
