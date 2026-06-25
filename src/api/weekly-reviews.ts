import api from './axios-client';
import { config } from '@/lib/config';
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
  let firstByteTime: number | null = null;
  let deltaCount = 0;
  let totalDeltaChars = 0;

  (async () => {
    try {
      const streamUrl = `${config.apiUrl}${ENDPOINTS.GENERATE_STREAM}`;
      console.log('[weekly-review stream] starting request to', streamUrl, 'data=', data);
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

      const fetchElapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`[weekly-review stream] fetch response: status=${response.status}, content-type=${response.headers.get('content-type')}, ${fetchElapsed}s`);

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
          const ttft = ((firstByteTime - startTime) / 1000).toFixed(2);
          console.log(`[weekly-review stream] first byte received after ${ttft}s`);
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
            if (event.type === 'delta') {
              const payload = JSON.parse(event.data) as { text: string };
              deltaCount++;
              totalDeltaChars += payload.text.length;
              if (deltaCount <= 3 || deltaCount % 20 === 0) {
                console.log(`[weekly-review stream] delta #${deltaCount} at ${eventTime}s: "${payload.text.substring(0, 40)}${payload.text.length > 40 ? '...' : ''}" (${totalDeltaChars} chars total)`);
              }
              callbacks.onDelta(payload.text);
            } else if (event.type === 'thinking') {
              const payload = JSON.parse(event.data) as { message: string };
              callbacks.onThinking?.(payload.message);
            } else if (event.type === 'finalizing') {
              console.log(`[weekly-review stream] finalizing event at ${eventTime}s, after ${deltaCount} deltas, ${totalDeltaChars} chars`);
              callbacks.onFinalizing();
            } else if (event.type === 'complete') {
              const payload = JSON.parse(event.data) as ApiResponse<WeeklyReview>;
              const parsed = WeeklyReviewResponseSchema.parse(payload);
              console.log(`[weekly-review stream] complete event at ${eventTime}s, after ${deltaCount} deltas, ${totalDeltaChars} chars, aiSummary=${parsed.data.aiSummary?.length ?? 0} chars`);
              callbacks.onComplete(parsed.data);
              return;
            } else if (event.type === 'error') {
              const payload = JSON.parse(event.data) as { message: string };
              console.error(`[weekly-review stream] error event at ${eventTime}s, after ${deltaCount} deltas, ${totalDeltaChars} chars: "${payload.message}"`);
              callbacks.onError(payload.message);
              return;
            } else {
              console.log(`[weekly-review stream] unknown event type "${event.type}" at ${eventTime}s: ${event.data.substring(0, 100)}`);
            }
          } catch (parseErr) {
            console.error(`[weekly-review stream] parse error at ${eventTime}s, event type="${event.type}", data="${event.data.substring(0, 200)}":`, parseErr);
            callbacks.onError((parseErr as Error).message || 'Invalid stream payload');
            return;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('[weekly-review stream] aborted by user');
        return;
      }
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      console.error(`[weekly-review stream] fetch error after ${elapsed}s, ${deltaCount} deltas:`, err);
      callbacks.onError((err as Error).message || 'Stream failed');
    }
  })();

  return controller;
}

function parseSSEEvent(raw: string): { type: string; data: string } | null {
  let type = 'message';
  let data = '';
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) {
      type = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data = line.slice(5).trim();
    }
  }
  if (!data) return null;
  return { type, data };
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
