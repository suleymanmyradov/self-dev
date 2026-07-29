import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="skeleton"
            className={cn('animate-pulse rounded-lg bg-muted', className)}
            style={{ animationDuration: '1.6s' }}
            {...props}
        />
    );
}

export { Skeleton };
