import { CenteredSkeleton } from '@/components/shared/page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <CenteredSkeleton maxWidth="max-w-lg">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </CenteredSkeleton>
  );
}
