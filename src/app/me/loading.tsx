import { PageSkeleton, CardSkeleton } from '@/components/shared/page-skeleton';

export default function Loading() {
  return (
    <PageSkeleton>
      <CardSkeleton className="h-64" />
    </PageSkeleton>
  );
}
