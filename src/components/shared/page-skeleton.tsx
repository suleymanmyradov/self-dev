import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shared skeleton primitives for `loading.tsx` files.
 *
 * These cover the two common loading layouts used across many routes
 * (centered auth-style and simple max-width page). Routes with bespoke
 * layouts keep their own `loading.tsx`.
 */

interface PageSkeletonProps {
  /** Tailwind max-width class for the content column, e.g. "max-w-2xl". */
  maxWidth?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A simple page shell: centered max-width column with a title + subtitle
 * skeleton header and an optional body. Used by routes whose loading
 * state is just "header + a few cards".
 */
export function PageSkeleton({
  maxWidth = 'max-w-2xl',
  className = '',
  children,
}: PageSkeletonProps) {
  return (
    <div className={`mx-auto w-full ${maxWidth} px-4 py-6 md:py-8 space-y-4 ${className}`}>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
      {children}
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

/** One or more full-width card-shaped skeletons. */
export function CardSkeleton({ count = 1, className = 'h-48' }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`w-full rounded-xl ${className}`} />
      ))}
    </>
  );
}

interface CenteredSkeletonProps {
  maxWidth?: string;
  children?: React.ReactNode;
}

/**
 * Vertically + horizontally centered skeleton, used by auth-style pages
 * (login, register, onboarding) whose real layout is a centered card.
 */
export function CenteredSkeleton({ maxWidth = 'max-w-md', children }: CenteredSkeletonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`w-full ${maxWidth} space-y-4`}>{children}</div>
    </div>
  );
}
