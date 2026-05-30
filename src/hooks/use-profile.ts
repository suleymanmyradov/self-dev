import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/api';

/**
 * Hook to fetch the current user's profile via TanStack Query.
 * Replaces manual useEffect fetches for consistent caching and error handling.
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data;
    },
  });
}
