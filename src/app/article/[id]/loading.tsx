import { Skeleton } from '@/components/ui/skeleton';

// =============================================================================
// Constants
// =============================================================================

const SKELETON_LINES = 6;

// =============================================================================
// Component
// =============================================================================

export default function ArticleLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      {/* Meta skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-lg" />
        <span className="text-muted-foreground">•</span>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Title skeleton */}
      <Skeleton className="mt-2 h-9 w-4/5" />

      <Skeleton className="my-6 h-px w-full" />

      {/* Content skeleton */}
      <div className="space-y-4">
        {Array.from({ length: SKELETON_LINES }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
