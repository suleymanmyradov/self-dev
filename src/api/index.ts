// API Client
export { api, ApiError } from './axios-client';
export type { RequestOptions } from './axios-client';

// Types
export type {
  // Pagination
  PageParams,
  PageResponse,
  ApiResponse,
  EmptyResponse,

  // Goal Types
  Goal,
  GoalCategory,
  GoalMeasurement,
  GoalMilestone,
  CreateGoalRequest,
  UpdateGoalRequest,
  UpdateGoalProgressRequest,
  LogGoalValueRequest,
  CreateMilestoneRequest,
  GoalsResponse,
  GoalResponse,
  DeleteMilestoneResponse,

  // Habit Types
  Habit,
  HabitCategory,
  CreateHabitRequest,
  UpdateHabitRequest,
  HabitsResponse,
  HabitResponse,

  // Check-In Types
  CheckIn,
  CheckInStatus,
  CheckInMood,
  CheckInEnergy,
  CheckInBlocker,
  CreateCheckInRequest,
  CheckInsResponse,
  CheckInResponse,

  // Auth Types
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  AuthResponse,
  RegisterResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  GoogleLoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,

  // Profile Types
  Profile,
  UpdateProfileRequest,
  ProfileResponse,

  // Article Types
  Article,
  ArticlesResponse,
  ArticleResponse,
  ListArticlesParams,
  LikeArticleRequest,
  LikeArticleResponse,
  ShareArticleRequest,
  ShareArticleResponse,
  GetAuthorArticlesParams,

  // Activity Types
  ActivityType,
  Activity,
  ActivityResponse,

  // Conversation Types
  ConversationType,
  MessageRole,
  Message,
  Conversation,
  ConversationDetail,
  StartConversationRequest,
  SendMessageRequest,
  ConversationsResponse,
  ConversationResponse,
  ConversationDetailResponse,
  MessagesResponse,
  MessageResponse,
  ListConversationsParams,

  // Settings Types
  AccountabilityStyle,
  Settings,
  UpdateSettingsRequest,
  SettingsResponse,
  NotificationPreferences,
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesRequest,
  UnreadNotificationCountResponse,

  // Personalization Types
  PreferredTone,
  DifficultyPreference,
  AdjustmentType,
  SuggestionStatus,
  SuggestionSource,
  CoachingProfile,
  PlanAdjustmentSuggestion,
  PersonalizationContext,
  UpdateCoachingProfilePreferencesRequest,
  CreatePlanAdjustmentSuggestionRequest,
  UpdatePlanAdjustmentSuggestionStatusRequest,
  ApplyPlanAdjustmentSuggestionRequest,
  GeneratePersonalizedCoachingRequest,
  GeneratePersonalizedCoachingResponse,
  CoachingProfileResponse,
  PersonalizationContextResponse,
  PlanAdjustmentSuggestionsResponse,
  PlanAdjustmentSuggestionResponse,
  PersonalizedCoachingResponse,

  // Notification Types
  NotificationType,
  Notification,
  NotificationsResponse,

  // Search Types
  SearchResultType,
  SearchResult,
  SearchResponse,
  SearchParams,

  // Saved Items Types
  SavedItemType,
  SavedItem,
  SavedItemDetailed,
  SaveItemRequest,
  SavedItemsResponse,
  SavedItemsDetailedResponse,
  SavedItemResponse,

  // Report Types
  ReportType,
  ReportRequest,
} from './types';

// Auth API
export {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  verifyEmail,
  resendVerification,
  googleLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
} from './auth';

// Goals API
export {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoal,
  updateGoalProgress,
  logGoalValue,
  createMilestone,
  toggleMilestone,
  deleteMilestone,
} from './goals';

// Habits API
export {
  listHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  resetTodayHabits,
} from './habits';

// Check-Ins API
export {
  createCheckIn,
  getTodayCheckIns,
  getCheckInHistory,
} from './check-ins';

// Categories API
export { listCategories } from './categories';

// Category Types
export type { Category, CategoriesResponse, EntityType } from './types';

// Site Settings API
export { listSiteSettings } from './site-settings';
export type { SiteSettingItem, SiteSettingsResponse, ExploreSettings, ExploreHeaderSetting, CommunityCardSetting } from './types';

// Template Types
export type { HabitTemplateItem, GoalTemplateItem, HabitTemplatesResponse, GoalTemplatesResponse, TemplateCategory } from './types';

// Articles API
export { listArticles, getArticle, likeArticle, shareArticle, getAuthorArticles } from './articles';

// Activities API
export { listActivities } from './activities';

// Saved Items API
export { listSavedItems, listSavedDetailed, saveItem, removeSavedItem } from './saved';

// Conversations API
export { listConversations, startConversation, getConversation, getMessages, sendMessage } from './conversations';

// Search API
export { search } from './search';

// Notifications API
export { listNotifications, markNotificationRead, markAllNotificationsRead } from './notifications';

// Settings API
export { getSettings, updateSettings } from './settings';

// Personalization API
export {
  getCoachingProfile,
  upsertCoachingProfile,
  updateCoachingProfilePreferences,
  getPersonalizationContext,
  getPendingPlanAdjustmentSuggestions,
  createPlanAdjustmentSuggestion,
  updatePlanAdjustmentSuggestionStatus,
  applyPlanAdjustmentSuggestion,
  generatePersonalizedCoaching,
  streamPersonalizedCoaching,
  generateOnboardingHabits,
} from './personalization';

// Report API
export { submitReport } from './report';

// Weekly Reviews API
export {
  generateWeeklyReview,
  getCurrentWeeklyReview,
  getWeeklyReview,
  listWeeklyReviews,
} from './weekly-reviews';

export type {
  WeeklyReview,
  WeeklyReviewHabitBreakdown,
  WeeklyReviewAdjustment,
  WeeklyReviewNextWeekPlan,
  WeeklyReviewAdjustmentType,
} from './types';

// Billing API
export {
  getBillingOverview,
  trackUpgradeEvent,
  createCheckoutSession,
  createCustomerPortalSession,
} from './billing';

// Billing Types
export type {
  Plan,
  UserSubscription,
  Entitlements,
  BillingOverview,
  UpgradeEventType,
  UpgradeSurface,
  UpgradeTrigger,
  UpgradeEventRequest,
  BillingOverviewResponse,
  UpgradeEventResponse,
  CheckoutSessionResponse,
  PortalSessionResponse,
  PlanLimitError,
} from './types';
