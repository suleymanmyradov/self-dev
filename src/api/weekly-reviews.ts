import api from './axios-client';
import { config } from '@/lib/config';
import { parseSSEEvent } from '@/lib/sse';
import {
  WeeklyReviewResponseSchema,
  WeeklyReviewsResponseSchema,
} from '@/lib/validation';
import type { ApiResponse, PageParams, WeeklyReview } from './types';

const ENDPOINTS = {
  WEEKLY_REVIEWS: '/weekly-reviews',
  CURRENT: '/weekly-reviews/current',
  GENERATE: '/weekly-reviews/generate',
  GENERATE_STREAM: '/weekly-reviews/generate-stream',
};

export async function generateWeeklyReview(data?: { weekStart?: string; forceRegenerate?: boolean }): Promise<ApiResponse<WeeklyReview>> {
  const response = await api.post<unknown>(ENDPOINTS.GENERATE, data ?? {});
  return WeeklyReviewResponseSchema.parse(response);
}

export interface WeeklyReviewStreamCallbacks {
  onDelta: (text: string) => void;
  onFinalizing: () => void;
  onComplete: (review: WeeklyReview) => void;
  onError: (message: string) => void;
  onThinking?: (message: string) => void;
}

/**
 * Streams a weekly review generation via SSE. The AI summary text arrives as
 * incremental deltas; the final persisted review object arrives in a
 * "complete" event. Returns an AbortController so the caller can cancel.
 */
export function generateWeeklyReviewStream(
  data: { weekStart?: string; forceRegenerate?: boolean },
  callbacks: WeeklyReviewStreamCallbacks,
): AbortController {
  const controller = new AbortController();
  const startTime = performance.now();
  const isDev = process.env.NODE_ENV !== 'production';
  let firstByteTime: number | null = null;
  let deltaCount = 0;
  let totalDeltaChars = 0;

  (async () => {
    try {
      const streamUrl = `${config.apiUrl}${ENDPOINTS.GENERATE_STREAM}`;
      if (isDev) console.log('[weekly-review stream] starting request to', streamUrl, 'data=', data);
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(data),
        credentials: 'include',
        signal: controller.signal,
      });

      if (isDev) {
        const fetchElapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        console.log(`[weekly-review stream] fetch response: status=${response.status}, content-type=${response.headers.get('content-type')}, ${fetchElapsed}s`);
      }

      if (!response.ok) {
        const text = await response.text().catch(() => 'Request failed');
        console.error('[weekly-review stream] HTTP error:', response.status, text);
        callbacks.onError(text);
        return;
      }

      if (!response.body) {
        console.error('[weekly-review stream] response.body is null');
        callbacks.onError('Response body is null');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Stream ended without a complete event — treat as error.
          const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
          console.error(`[weekly-review stream] stream ended (done=true) after ${elapsed}s, ${deltaCount} deltas, ${totalDeltaChars} chars — no complete event`);
          callbacks.onError('Stream ended unexpectedly');
          return;
        }

        if (firstByteTime === null) {
          firstByteTime = performance.now();
          if (isDev) {
            const ttft = ((firstByteTime - startTime) / 1000).toFixed(2);
            console.log(`[weekly-review stream] first byte received after ${ttft}s`);
          }
        }

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by \n\n. Process complete events.
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const event = parseSSEEvent(rawEvent);
          if (!event) continue;

          const eventTime = ((performance.now() - startTime) / 1000).toFixed(2);

          try {
            if (event.event === 'delta') {
              const payload = JSON.parse(event.data) as { text: string };
              deltaCount++;
              totalDeltaChars += payload.text.length;
              if (isDev && (deltaCount <= 3 || deltaCount % 20 === 0)) {
                console.log(`[weekly-review stream] delta #${deltaCount} at ${eventTime}s: "${payload.text.substring(0, 40)}${payload.text.length > 40 ? '...' : ''}" (${totalDeltaChars} chars total)`);
              }
              callbacks.onDelta(payload.text);
            } else if (event.event === 'thinking') {
              const payload = JSON.parse(event.data) as { message: string };
              callbacks.onThinking?.(payload.message);
            } else if (event.event === 'finalizing') {
              if (isDev) console.log(`[weekly-review stream] finalizing event at ${eventTime}s, after ${deltaCount} deltas, ${totalDeltaChars} chars`);
              callbacks.onFinalizing();
            } else if (event.event === 'complete') {
              const payload = JSON.parse(event.data);
              // The backend wraps the review in {data: WeeklyReview}, but some
              // code paths / older versions may send the raw review directly.
              // Handle both shapes to avoid a Zod "data: Required" crash.
              const rawReview = payload?.data ?? payload;
              const parsed = WeeklyReviewResponseSchema.parse({ data: rawReview });
              if (isDev) console.log(`[weekly-review stream] complete event at ${eventTime}s, after ${deltaCount} deltas, ${totalDeltaChars} chars, aiSummary=${parsed.data.aiSummary?.length ?? 0} chars`);
              callbacks.onComplete(parsed.data);
              return;
            } else if (event.event === 'error') {
              const payload = JSON.parse(event.data) as { message: string };
              console.error(`[weekly-review stream] error event at ${eventTime}s, after ${deltaCount} deltas, ${totalDeltaChars} chars: "${payload.message}"`);
              callbacks.onError(payload.message);
              return;
            } else {
              if (isDev) console.log(`[weekly-review stream] unknown event type "${event.event}" at ${eventTime}s: ${event.data.substring(0, 100)}`);
            }
          } catch (parseErr) {
            console.error(`[weekly-review stream] parse error at ${eventTime}s, event type="${event.event}", data="${event.data.substring(0, 200)}":`, parseErr);
            callbacks.onError((parseErr as Error).message || 'Invalid stream payload');
            return;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        if (isDev) console.log('[weekly-review stream] aborted by user');
        return;
      }
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      console.error(`[weekly-review stream] fetch error after ${elapsed}s, ${deltaCount} deltas:`, err);
      callbacks.onError((err as Error).message || 'Stream failed');
    }
  })();

  return controller;
}

export async function getCurrentWeeklyReview(): Promise<ApiResponse<WeeklyReview>> {
  const response = await api.get<unknown>(ENDPOINTS.CURRENT);
  return WeeklyReviewResponseSchema.parse(response);
}

export async function getWeeklyReview(weekStart: string): Promise<ApiResponse<WeeklyReview>> {
  const response = await api.get<unknown>(`${ENDPOINTS.WEEKLY_REVIEWS}/${encodeURIComponent(weekStart)}`);
  return WeeklyReviewResponseSchema.parse(response);
}

export async function listWeeklyReviews(params: PageParams): Promise<ApiResponse<WeeklyReview[]>> {
  const response = await api.get<unknown>(ENDPOINTS.WEEKLY_REVIEWS, params);
  return WeeklyReviewsResponseSchema.parse(response);
}
