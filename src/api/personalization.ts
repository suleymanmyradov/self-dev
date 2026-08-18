import api from './axios-client';
import { config } from '@/lib/config';
import {
  CoachingProfileResponseSchema,
  PersonalizationContextResponseSchema,
  PlanAdjustmentSuggestionsResponseSchema,
  PlanAdjustmentSuggestionResponseSchema,
  UpdateCoachingProfilePreferencesRequestSchema,
  CreatePlanAdjustmentSuggestionRequestSchema,
  UpdatePlanAdjustmentSuggestionStatusRequestSchema,
  ApplyPlanAdjustmentSuggestionRequestSchema,
  GeneratePersonalizedCoachingRequestSchema,
  PersonalizedCoachingResponseSchema,
  GenerateOnboardingHabitsRequestSchema,
  GenerateOnboardingHabitsResponseSchema,
} from '@/lib/validation';
import type {
  CoachingProfile,
  PersonalizationContext,
  PlanAdjustmentSuggestion,
  UpdateCoachingProfilePreferencesRequest,
  CreatePlanAdjustmentSuggestionRequest,
  UpdatePlanAdjustmentSuggestionStatusRequest,
  ApplyPlanAdjustmentSuggestionRequest,
  GeneratePersonalizedCoachingRequest,
  GeneratePersonalizedCoachingResponse,
  GenerateOnboardingHabitsRequest,
  OnboardingHabitSuggestion,
} from './types';

const ENDPOINTS = {
  COACHING_PROFILE: '/personalization/coaching-profile',
  COACHING_PROFILE_PREFERENCES: '/personalization/coaching-profile/preferences',
  PERSONALIZATION_CONTEXT: '/personalization/context',
  PLAN_ADJUSTMENT_SUGGESTIONS: '/personalization/plan-adjustments',
  PERSONALIZED_COACHING: '/personalization/coaching',
  COACHING_STREAM: '/personalization/coaching-stream',
  ONBOARDING_HABITS: '/personalization/onboarding-habits',
};

export interface UpsertCoachingProfileRequest {
  accountabilityStyle: 'gentle' | 'balanced' | 'strict';
  preferredTone: 'supportive' | 'direct' | 'warm' | 'practical' | 'challenging';
  difficultyPreference: 'easy' | 'adaptive' | 'ambitious';
  primaryMotivation?: string;
  commonBlockers?: string[];
  coachingNotes?: Record<string, unknown>;
}

/**
 * Get coaching profile
 */
export async function getCoachingProfile(): Promise<CoachingProfile> {
  const response = await api.get<unknown>(ENDPOINTS.COACHING_PROFILE);
  const parsed = CoachingProfileResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Upsert coaching profile
 */
export async function upsertCoachingProfile(
  data: UpsertCoachingProfileRequest
): Promise<CoachingProfile> {
  const response = await api.post<unknown>(ENDPOINTS.COACHING_PROFILE, data);
  const parsed = CoachingProfileResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Update coaching profile preferences
 */
export async function updateCoachingProfilePreferences(
  data: UpdateCoachingProfilePreferencesRequest
): Promise<CoachingProfile> {
  const validated = UpdateCoachingProfilePreferencesRequestSchema.parse(data);
  const response = await api.put<unknown>(ENDPOINTS.COACHING_PROFILE_PREFERENCES, validated);
  const parsed = CoachingProfileResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Get personalization context
 */
export async function getPersonalizationContext(forceRefresh = false): Promise<PersonalizationContext> {
  const response = await api.get<unknown>(
    ENDPOINTS.PERSONALIZATION_CONTEXT,
    { forceRefresh }
  );
  const parsed = PersonalizationContextResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Get pending plan adjustment suggestions
 */
export async function getPendingPlanAdjustmentSuggestions(): Promise<PlanAdjustmentSuggestion[]> {
  const response = await api.get<unknown>(ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS);
  const parsed = PlanAdjustmentSuggestionsResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Create plan adjustment suggestion
 */
export async function createPlanAdjustmentSuggestion(
  data: CreatePlanAdjustmentSuggestionRequest
): Promise<PlanAdjustmentSuggestion> {
  const validated = CreatePlanAdjustmentSuggestionRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS, validated);
  const parsed = PlanAdjustmentSuggestionResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Update plan adjustment suggestion status
 */
export async function updatePlanAdjustmentSuggestionStatus(
  suggestionId: string,
  data: UpdatePlanAdjustmentSuggestionStatusRequest
): Promise<PlanAdjustmentSuggestion> {
  const validated = UpdatePlanAdjustmentSuggestionStatusRequestSchema.parse(data);
  const response = await api.put<unknown>(
    `${ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS}/${encodeURIComponent(suggestionId)}/status`,
    validated
  );
  const parsed = PlanAdjustmentSuggestionResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Apply plan adjustment suggestion
 */
export async function applyPlanAdjustmentSuggestion(
  data: ApplyPlanAdjustmentSuggestionRequest
): Promise<PlanAdjustmentSuggestion> {
  const validated = ApplyPlanAdjustmentSuggestionRequestSchema.parse(data);
  const response = await api.post<unknown>(
    `${ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS}/${encodeURIComponent(validated.id)}/apply`
  );
  const parsed = PlanAdjustmentSuggestionResponseSchema.parse(response);
  return parsed.data;
}

/**
 * Generate personalized coaching response
 */
export async function generatePersonalizedCoaching(
  data: GeneratePersonalizedCoachingRequest
): Promise<GeneratePersonalizedCoachingResponse> {
  const validated = GeneratePersonalizedCoachingRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.PERSONALIZED_COACHING, validated);
  const parsed = PersonalizedCoachingResponseSchema.parse(response);
  return parsed.data;
}

export interface CoachingStreamCallbacks {
  onDelta: (text: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (message: string) => void;
  onThinking?: (message: string) => void;
  onReasoning?: (text: string) => void;
  onProposal?: (proposal: CoachingProposal) => void;
}

/**
 * A proposal action emitted by the agentic coaching flow. The agent calls
 * a propose_* tool to prepare a goal/habit create/update/delete; the
 * backend forwards it as an SSE "proposal" event. The client renders a
 * confirm card and calls the existing CRUD endpoint on accept.
 */
export type ProposalAction =
  | 'create_goal'
  | 'update_goal'
  | 'delete_goal'
  | 'create_habit'
  | 'update_habit'
  | 'delete_habit';

export interface CoachingProposal {
  id: string;
  action: ProposalAction;
  payload: Record<string, unknown>;
}

/**
 * Streams a personalized coaching response via SSE. The coaching text arrives
 * as incremental deltas; the full response arrives in a "complete" event.
 * Returns an AbortController so the caller can cancel.
 *
 * This goes through the gateway → client RPC → ai-coach microservice, which
 * assembles the personalization context (goals, habits, check-ins, pattern
 * insights) and builds the system prompt server-side. The frontend has zero
 * prompt logic.
 */
export function streamPersonalizedCoaching(
  data: { userMessage: string; context?: string; conversationId?: string },
  callbacks: CoachingStreamCallbacks,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const streamUrl = `${config.apiUrl}${ENDPOINTS.COACHING_STREAM}`;
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

      if (!response.ok) {
        const text = await response.text().catch(() => 'Request failed');
        console.error('[coaching-stream] HTTP error', response.status, text);
        callbacks.onError(COACHING_ERROR_GENERIC);
        return;
      }

      if (!response.body) {
        console.error('[coaching-stream] response body is null');
        callbacks.onError(COACHING_ERROR_GENERIC);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.error('[coaching-stream] stream ended without complete event');
          callbacks.onError(COACHING_ERROR_GENERIC);
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const event = parseCoachingSSEEvent(rawEvent);
          if (!event) continue;

          try {
            if (event.type === 'delta') {
              const payload = JSON.parse(event.data) as { text: string };
              callbacks.onDelta(payload.text);
            } else if (event.type === 'reasoning') {
              const payload = JSON.parse(event.data) as { text: string };
              callbacks.onReasoning?.(payload.text);
            } else if (event.type === 'thinking') {
              const payload = JSON.parse(event.data) as { message: string };
              callbacks.onThinking?.(payload.message);
            } else if (event.type === 'proposal') {
              const payload = JSON.parse(event.data) as CoachingProposal;
              callbacks.onProposal?.(payload);
            } else if (event.type === 'complete') {
              const payload = JSON.parse(event.data) as { fullResponse: string };
              callbacks.onComplete(payload.fullResponse);
              return;
            } else if (event.type === 'error') {
              const payload = JSON.parse(event.data) as { message: string };
              callbacks.onError(payload.message);
              return;
            }
          } catch (parseErr) {
            console.error('[coaching-stream] failed to parse SSE event', parseErr, event);
            callbacks.onError(COACHING_ERROR_GENERIC);
            return;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      console.error('[coaching-stream] fetch failed', err);
      callbacks.onError(COACHING_ERROR_GENERIC);
    }
  })();

  return controller;
}

/**
 * Generic user-facing error message for coaching stream failures that don't
 * come with a server-provided message (HTTP errors, network failures, parse
 * errors, unexpected stream termination). The technical details are logged to
 * the console for debugging; the user only sees this friendly fallback.
 */
const COACHING_ERROR_GENERIC =
  "Something went wrong on my end. Please try sending your message again.";

function parseCoachingSSEEvent(raw: string): { type: string; data: string } | null {
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

/**
 * Generate 3 daily habit suggestions from structured onboarding data.
 *
 * This is a server-owned endpoint: the client sends only structured onboarding
 * fields (goal, motivation, blocker, etc.), never a prompt or tools. The
 * backend builds the prompt, runs the safety classifier on the user free-text,
 * and returns validated structured JSON.
 */
export async function generateOnboardingHabits(
  data: GenerateOnboardingHabitsRequest
): Promise<OnboardingHabitSuggestion[]> {
  const validated = GenerateOnboardingHabitsRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.ONBOARDING_HABITS, validated);
  const parsed = GenerateOnboardingHabitsResponseSchema.parse(response);
  return parsed.data;
}
