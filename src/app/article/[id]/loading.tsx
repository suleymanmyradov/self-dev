import { Skeleton } from '@/components/ui/skeleton';

export default function ArticleLoading() {
  return (
    <div className="h-full flex-1 overflow-y-auto no-scrollbar">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-2/3 mb-3" />
        <Skeleton className="h-4 w-1/3 mb-6" />
        <Skeleton className="h-64 w-full rounded-md mb-6" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
