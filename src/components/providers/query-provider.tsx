"use client";

import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import type { DehydratedState } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api/axios-client";
import { isDev } from "@/lib/config";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "An unexpected error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function QueryProvider({
  children,
  dehydratedState,
}: {
  children: ReactNode;
  dehydratedState?: DehydratedState | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && "status" in error) {
                const status = (error as { status: number }).status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
            onError: (error) => {
              const message = getErrorMessage(error);
              if (isDev) {
                // eslint-disable-next-line no-console
                console.error("[Mutation Error]", error);
              }
              toast.error(message);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
