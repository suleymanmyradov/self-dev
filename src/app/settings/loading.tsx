import { PageSkeleton, CardSkeleton } from '@/components/shared/page-skeleton';

export default function Loading() {
  return (
    <PageSkeleton>
      <CardSkeleton count={2} />
    </PageSkeleton>
  );
}
