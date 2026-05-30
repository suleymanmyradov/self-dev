import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Skeleton className="h-32 w-full max-w-sm rounded-xl" />
    </div>
  );
}
