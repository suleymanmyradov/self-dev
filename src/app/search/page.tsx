import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchClient } from '@/components/search/search-client';
import { SearchSkeleton } from '@/components/search/search-skeleton';

export const metadata: Metadata = {
  title: 'Search | Growth',
  description: 'Search for articles, habits, goals, and more.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchClient />
    </Suspense>
  );
}
