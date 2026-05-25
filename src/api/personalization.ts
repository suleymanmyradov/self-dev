import api from './client';
import type {
  AccountabilityStyle,
  DifficultyPreference,
  PreferredTone,
  CoachingProfile,
  CoachingProfileResponse,
  PersonalizationContext,
  PersonalizationContextResponse,
  PlanAdjustmentSuggestion,
  PlanAdjustmentSuggestionsResponse,
  PlanAdjustmentSuggestionResponse,
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
  accountabilityStyle: AccountabilityStyle;
  preferredTone: PreferredTone;
  difficultyPreference: DifficultyPreference;
  primaryMotivation?: string;
  commonBlockers?: string[];
  coachingNotes?: Record<string, unknown>;
}

/**
 * Get coaching profile
 */
export async function getCoachingProfile(): Promise<CoachingProfile> {
  const response = await api.get<CoachingProfileResponse>(ENDPOINTS.COACHING_PROFILE);
  return response.data;
}

/**
 * Upsert coaching profile
 */
export async function upsertCoachingProfile(
  data: UpsertCoachingProfileRequest
): Promise<CoachingProfile> {
  const response = await api.post<CoachingProfileResponse>(ENDPOINTS.COACHING_PROFILE, data);
  return response.data;
}

/**
 * Update coaching profile preferences
 */
export async function updateCoachingProfilePreferences(
  data: UpdateCoachingProfilePreferencesRequest
): Promise<CoachingProfile> {
  const response = await api.put<CoachingProfileResponse>(ENDPOINTS.COACHING_PROFILE_PREFERENCES, data);
  return response.data;
}

/**
 * Get personalization context
 */
export async function getPersonalizationContext(forceRefresh = false): Promise<PersonalizationContext> {
  const response = await api.get<PersonalizationContextResponse>(
    ENDPOINTS.PERSONALIZATION_CONTEXT,
    { forceRefresh }
  );
  return response.data;
}

/**
 * Get pending plan adjustment suggestions
 */
export async function getPendingPlanAdjustmentSuggestions(): Promise<PlanAdjustmentSuggestion[]> {
  const response = await api.get<PlanAdjustmentSuggestionsResponse>(ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS);
  return response.data;
}

/**
 * Create plan adjustment suggestion
 */
export async function createPlanAdjustmentSuggestion(
  data: CreatePlanAdjustmentSuggestionRequest
): Promise<PlanAdjustmentSuggestion> {
  const response = await api.post<PlanAdjustmentSuggestionResponse>(ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS, data);
  return response.data;
}

/**
 * Update plan adjustment suggestion status
 */
export async function updatePlanAdjustmentSuggestionStatus(
  suggestionId: string,
  data: UpdatePlanAdjustmentSuggestionStatusRequest
): Promise<PlanAdjustmentSuggestion> {
  const response = await api.put<PlanAdjustmentSuggestionResponse>(
    `${ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS}/${suggestionId}/status`,
    data
  );
  return response.data;
}

/**
 * Apply plan adjustment suggestion
 */
export async function applyPlanAdjustmentSuggestion(
  data: ApplyPlanAdjustmentSuggestionRequest
): Promise<PlanAdjustmentSuggestion> {
  const response = await api.post<PlanAdjustmentSuggestionResponse>(
    `${ENDPOINTS.PLAN_ADJUSTMENT_SUGGESTIONS}/${data.id}/apply`
  );
  return response.data;
}

/**
 * Generate personalized coaching response
 */
export async function generatePersonalizedCoaching(
  data: GeneratePersonalizedCoachingRequest
): Promise<GeneratePersonalizedCoachingResponse> {
  return api.post<GeneratePersonalizedCoachingResponse>(ENDPOINTS.PERSONALIZED_COACHING, data);
}