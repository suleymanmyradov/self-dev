import api from './axios-client';
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
} from './types';

const ENDPOINTS = {
  COACHING_PROFILE: '/personalization/coaching-profile',
  COACHING_PROFILE_PREFERENCES: '/personalization/coaching-profile/preferences',
  PERSONALIZATION_CONTEXT: '/personalization/context',
  PLAN_ADJUSTMENT_SUGGESTIONS: '/personalization/plan-adjustments',
  PERSONALIZED_COACHING: '/personalization/coaching',
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
