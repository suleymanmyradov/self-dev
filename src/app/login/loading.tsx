import { CenteredSkeleton } from '@/components/shared/page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <CenteredSkeleton>
      <Skeleton className="h-10 w-3/4 mx-auto" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-10 w-full" />
    </CenteredSkeleton>
  );
}
