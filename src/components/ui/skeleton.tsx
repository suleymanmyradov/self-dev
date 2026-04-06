import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="skeleton"
            className={cn(
                'relative overflow-hidden rounded-lg bg-muted',
                'before:absolute before:inset-0 before:-translate-x-full',
                'before:bg-gradient-to-r before:from-transparent before:via-background/50 before:to-transparent',
                'before:animate-[shimmer_2s_infinite]',
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };
