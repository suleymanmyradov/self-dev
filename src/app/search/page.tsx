import { Suspense } from 'react';
import { SearchClient } from '@/components/search/search-client';
import { SearchSkeleton } from '@/components/search/search-skeleton';

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchClient />
    </Suspense>
  );
}
