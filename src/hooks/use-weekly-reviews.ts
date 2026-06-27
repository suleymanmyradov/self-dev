import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generateWeeklyReview, generateWeeklyReviewStream, getCurrentWeeklyReview, getWeeklyReview, listWeeklyReviews } from '@/api/weekly-reviews';
import type { ApiResponse, WeeklyReview } from '@/api';
import { toast } from 'sonner';

export function useCurrentWeeklyReview(initialData?: ApiResponse<WeeklyReview | null>) {
  return useQuery({
    queryKey: ['weeklyReviews', 'current'],
    queryFn: () => getCurrentWeeklyReview(),
    select: (data) => data.data,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeeklyReview(weekStart: string) {
  return useQuery({
    queryKey: ['weeklyReviews', weekStart],
    queryFn: () => getWeeklyReview(weekStart),
    select: (data) => data.data,
    enabled: Boolean(weekStart),
  });
}

const DEFAULT_WEEKLY_REVIEWS_PARAMS = { page: 1, limit: 10 };

export function useWeeklyReviews(params = DEFAULT_WEEKLY_REVIEWS_PARAMS, initialData?: ApiResponse<WeeklyReview[]>) {
  const { page, limit } = params;
  return useQuery({
    queryKey: ['weeklyReviews', page ?? 1, limit ?? 10],
    queryFn: () => listWeeklyReviews({ page, limit }),
    select: (data) => data.data,
    initialData,
  });
}

export function useGenerateWeeklyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateWeeklyReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyReviews'] });
      toast.success('Weekly review generated successfully');
    },
  });
}

/**
 * Streaming version of useGenerateWeeklyReview.
 *
 * Calls the SSE endpoint and exposes:
 *   - streamingText: the AI summary text as it arrives (incremental)
 *   - isStreaming: true while the stream is active
 *   - mutate: starts the stream
 *   - cancel: aborts the stream
 *
 * On completion, invalidates the weekly review queries so the UI picks up the
 * persisted review (with adjustments, next-week plan, etc.).
 */
export function useGenerateWeeklyReviewStream() {
  const queryClient = useQueryClient();
  const controllerRef = useRef<AbortController | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('');

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  const mutate = useCallback(
    (data: { weekStart?: string; forceRegenerate?: boolean }) => {
      // Cancel any existing stream.
      controllerRef.current?.abort();
      setStreamingText('');
      setIsStreaming(true);
      setIsFinalizing(false);
      setThinkingMessage('');

      controllerRef.current = generateWeeklyReviewStream(data, {
        onDelta: (text) => {
          setStreamingText((prev) => prev + text);
          setThinkingMessage('');
        },
        onThinking: (message) => {
          setThinkingMessage(message);
        },
        onFinalizing: () => {
          setIsFinalizing(true);
          setThinkingMessage('');
        },
        onComplete: (review) => {
          setIsStreaming(false);
          setIsFinalizing(false);
          setThinkingMessage('');
          controllerRef.current = null;
          queryClient.setQueryData(['weeklyReviews', 'current'], { data: review });
          queryClient.invalidateQueries({ queryKey: ['weeklyReviews'] });
          toast.success('Weekly review generated successfully');
        },
        onError: (message) => {
          setIsStreaming(false);
          setIsFinalizing(false);
          setThinkingMessage('');
          controllerRef.current = null;
          console.error('[useGenerateWeeklyReviewStream] error:', message);
          toast.error(message);
        },
      });
    },
    [queryClient],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsStreaming(false);
    setIsFinalizing(false);
    setThinkingMessage('');
  }, []);

  return { mutate, cancel, streamingText, isStreaming, isFinalizing, thinkingMessage };
}
