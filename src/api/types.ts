// ============================================
// Pagination
// ============================================

export interface PageParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface PageResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Generic API Response
// ============================================

export interface ApiResponse<T> {
  data: T;
  page?: PageResponse;
}

export type EmptyResponse = Record<string, never>;

// ============================================
// Goal Types
// ============================================

export type GoalCategory = 'productivity' | 'health' | 'mindfulness';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  dueDate?: string;
  progress: number;
  completed: boolean;
  relatedHabitIds?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  category: GoalCategory;
  dueDate?: string;
  relatedHabitIds?: string[];
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  category?: GoalCategory;
  dueDate?: string;
  relatedHabitIds?: string[];
}

export interface UpdateGoalProgressRequest {
  progress: number;
}

export interface GoalsResponse extends ApiResponse<Goal[]> {
  page: PageResponse;
}

export type GoalResponse = ApiResponse<Goal>;

// ============================================
// Habit Types
// ============================================

export type HabitCategory = 'productivity' | 'health' | 'mindfulness';

export interface Habit {
  id: string;
  name: string;
  description: string;
  streak: number;
  completed: boolean;
  category: HabitCategory;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitRequest {
  name: string;
  description: string;
  category: HabitCategory;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  category?: HabitCategory;
}

export interface HabitsResponse extends ApiResponse<Habit[]> {
  page: PageResponse;
}

export type HabitResponse = ApiResponse<Habit>;

// ============================================
// Check-In Types
// ============================================

export type CheckInStatus = 'completed' | 'missed';
export type CheckInMood = 'great' | 'okay' | 'low' | 'stressed';
export type CheckInEnergy = 'high' | 'medium' | 'low';
export type CheckInBlocker = 'lack_of_time' | 'low_motivation' | 'too_distracted' | 'unclear_plan' | 'other';

export interface CheckIn {
  id: string;
  userId: string;
  habitId: string;
  status: CheckInStatus;
  mood?: CheckInMood;
  energy?: CheckInEnergy;
  blocker?: CheckInBlocker;
  note?: string;
  createdAt: string;
}

export interface CreateCheckInRequest {
  habitId: string;
  status: CheckInStatus;
  mood?: CheckInMood;
  energy?: CheckInEnergy;
  blocker?: CheckInBlocker;
  note?: string;
}

export interface CreateCheckInResponseData {
  checkIn: CheckIn;
  habit: Habit;
  aiFeedback?: string;
}

export type CheckInsResponse = ApiResponse<CheckIn[]>;
export type CheckInResponse = ApiResponse<CheckIn>;

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Profile;
}

// ============================================
// Profile Types
// ============================================

export interface Profile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  avatarUrl?: string;
}

export type ProfileResponse = ApiResponse<Profile>;

// ============================================
// Article Types
// ============================================

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category?: ArticleCategory;
  readTime: number;
  imageUrl: string;
  author: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse extends ApiResponse<Article[]> {
  page: PageResponse;
}

export type ArticleResponse = ApiResponse<Article>;

export interface ListArticlesParams extends PageParams {
  category?: string;
}

export interface LikeArticleRequest {
  id: string;
}

export interface LikeArticleResponse {
  success: boolean;
  newLikeCount: number;
}

export interface ShareArticleRequest {
  id: string;
  platform: string;
}

export interface ShareArticleResponse {
  success: boolean;
}

export interface GetAuthorArticlesParams extends PageParams {
  authorId: string;
}

// ============================================
// Activity Types
// ============================================

export type ActivityType = 'habit_completed' | 'goal_created' | 'goal_completed' | 'article_saved' | 'check_in_completed' | 'check_in_missed' | 'weekly_review_generated';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: string;
  userId: string;
  createdAt: string;
}

export interface ActivityResponse extends ApiResponse<Activity[]> {
  page: PageResponse;
}

// ============================================
// Conversation Types
// ============================================

export type ConversationType = 'coach' | 'therapist';
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  conversationId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  type: ConversationType;
  lastMessage: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface StartConversationRequest {
  type: ConversationType;
  title?: string;
  initialMessage?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface ConversationsResponse extends ApiResponse<Conversation[]> {
  page: PageResponse;
}

export type ConversationResponse = ApiResponse<Conversation>;

export type ConversationDetailResponse = ApiResponse<ConversationDetail>;

export interface MessagesResponse extends ApiResponse<Message[]> {
  page: PageResponse;
}

export type MessageResponse = ApiResponse<Message>;

export interface ListConversationsParams extends PageParams {
  type?: ConversationType;
}

// ============================================
// Settings Types
// ============================================

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  habitReminders: boolean;
  goalReminders: boolean;
  accountabilityStyle: 'gentle' | 'balanced' | 'strict';
  checkInTime: string;
  onboardingCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  habitReminders?: boolean;
  goalReminders?: boolean;
  accountabilityStyle?: AccountabilityStyle;
  checkInTime?: string;
  onboardingCompleted?: boolean;
}

export type SettingsResponse = ApiResponse<Settings>;

// ============================================
// Notification Types
// ============================================

export type WeeklyReviewAdjustmentType =
  | 'keep_same'
  | 'reduce_difficulty'
  | 'change_time'
  | 'clarify_plan'
  | 'pause_habit';

export interface WeeklyReviewHabitBreakdown {
  habitId: string;
  habitName: string;
  category?: string;
  totalCheckIns: number;
  completedCount: number;
  missedCount: number;
  completionRate: number;
  lastCheckInAt?: string;
}

export interface WeeklyReviewAdjustment {
  habitId?: string;
  habitName: string;
  adjustmentType: WeeklyReviewAdjustmentType;
  reason: string;
  suggestion: string;
}

export interface WeeklyReviewNextWeekPlan {
  focus: string;
  commitments: string[];
  risks: string[];
  recoveryActions: string[];
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  totalHabits: number;
  completedCheckIns: number;
  missedCheckIns: number;
  completionRate: number;
  bestDay?: string;
  hardestDay?: string;
  topBlocker?: string;
  moodSummary: Record<string, number>;
  energySummary: Record<string, number>;
  habitBreakdown: WeeklyReviewHabitBreakdown[];
  aiSummary?: string;
  suggestedAdjustments: WeeklyReviewAdjustment[];
  nextWeekPlan: WeeklyReviewNextWeekPlan;
  generatedAt: string;
}

export type NotificationType = 'habit_reminder' | 'goal_deadline' | 'achievement' | 'system' | 'missed_check_in' | 'weekly_review' | 'encouragement' | 'ai_feedback';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  createdAt: string;
}

export interface NotificationsResponse extends ApiResponse<Notification[]> {
  page: PageResponse;
}

// ============================================
// Search Types
// ============================================

export type SearchResultType = 'article' | 'goal' | 'habit' | 'conversation';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  score: number;
  highlight?: string;
}

export interface SearchResponse extends ApiResponse<SearchResult[]> {
  page: PageResponse;
}

export interface SearchParams extends PageParams {
  q: string;
  type?: SearchResultType;
}

// ============================================
// Saved Items Types
// ============================================

export type SavedItemType = 'article' | 'goal' | 'habit';

export interface SavedItem {
  id: string;
  itemType: SavedItemType;
  itemId: string;
  userId: string;
  createdAt: string;
}

export interface SaveItemRequest {
  itemType: SavedItemType;
  itemId: string;
}

export interface SavedItemsResponse extends ApiResponse<SavedItem[]> {
  page: PageResponse;
}

export type SavedItemResponse = ApiResponse<SavedItem>;

export interface SavedItemDetailed extends SavedItem {
  article?: Article;
  habit?: Habit;
  goal?: Goal;
}

export interface SavedItemsDetailedResponse extends ApiResponse<SavedItemDetailed[]> {
  page: PageResponse;
}

// ============================================
// Report Types
// ============================================

export type ReportType = 'bug' | 'feedback' | 'abuse';

export interface ReportRequest {
  type: ReportType;
  title: string;
  description: string;
  email?: string;
}

// ============================================
// Category Types
// ============================================

export type EntityType = 'article' | 'habit' | 'goal';

export interface Category {
  id: string;
  name: string;
  slug: string;
  entityType: EntityType;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoriesResponse = ApiResponse<Category[]>;

// ============================================
// Personalization Types
// ============================================

export type AccountabilityStyle = 'gentle' | 'balanced' | 'strict';
export type PreferredTone = 'supportive' | 'direct' | 'warm' | 'practical' | 'challenging';
export type DifficultyPreference = 'easy' | 'adaptive' | 'ambitious';
export type AdjustmentType = 'reduce_difficulty' | 'increase_difficulty' | 'change_time' | 'clarify_plan' | 'pause' | 'keep_same';
export type SuggestionStatus = 'pending' | 'accepted' | 'dismissed' | 'applied';
export type SuggestionSource = 'check_in' | 'weekly_review' | 'assistant' | 'pattern_analysis';

export interface CoachingProfile {
  id: string;
  userId: string;
  accountabilityStyle: AccountabilityStyle;
  preferredTone: PreferredTone;
  difficultyPreference: DifficultyPreference;
  primaryMotivation?: string;
  commonBlockers: string[];
  coachingNotes: Record<string, unknown>;
  lastContextRefreshAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanAdjustmentSuggestion {
  id: string;
  userId: string;
  goalId?: string;
  habitId?: string;
  source: SuggestionSource;
  adjustmentType: AdjustmentType;
  reason: string;
  suggestion: string;
  status: SuggestionStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizationContext {
  profile: CoachingProfile;
  activeGoals: Goal[];
  activeHabits: Habit[];
  recentCheckIns: CheckIn[];
  latestWeeklyReview?: WeeklyReview;
  pendingSuggestions: PlanAdjustmentSuggestion[];
  patternInsights: Record<string, string>;
}

export interface UpdateCoachingProfilePreferencesRequest {
  accountabilityStyle: AccountabilityStyle;
  preferredTone: PreferredTone;
  difficultyPreference: DifficultyPreference;
}

export interface CreatePlanAdjustmentSuggestionRequest {
  goalId?: string;
  habitId?: string;
  source: SuggestionSource;
  adjustmentType: AdjustmentType;
  reason: string;
  suggestion: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePlanAdjustmentSuggestionStatusRequest {
  status: SuggestionStatus;
}

export interface ApplyPlanAdjustmentSuggestionRequest {
  id: string;
}

export interface GeneratePersonalizedCoachingRequest {
  userMessage: string;
  context?: string;
}

export interface GeneratePersonalizedCoachingResponse {
  coachingResponse: string;
  context?: string;
}

export type CoachingProfileResponse = ApiResponse<CoachingProfile>;
export type PersonalizationContextResponse = ApiResponse<PersonalizationContext>;
export interface PlanAdjustmentSuggestionsResponse extends ApiResponse<PlanAdjustmentSuggestion[]> {
  total: number;
}
export type PlanAdjustmentSuggestionResponse = ApiResponse<PlanAdjustmentSuggestion>;
export type PersonalizedCoachingResponse = ApiResponse<GeneratePersonalizedCoachingResponse>;

// ============================================
// Billing / Monetization Types
// ============================================

export interface Plan {
  id: string;
  code: 'free' | 'pro';
  name: string;
  description?: string;
  priceMonthlyCents: number;
  priceAnnualCents: number;
  /** Note: 0 or undefined means unlimited. Prefer using canCreateGoal/canCreateHabit/etc booleans from Entitlements. */
  activeGoalLimit?: number;
  /** Note: 0 or undefined means unlimited. Prefer using canCreateGoal/canCreateHabit/etc booleans from Entitlements. */
  activeHabitLimit?: number;
  /** Note: 0 or undefined means unlimited. Prefer using canViewWeeklyReviewHistory boolean from Entitlements. */
  weeklyReviewHistoryLimit?: number;
  /** Note: 0 or undefined means unlimited. Prefer using canCreatePlanAdjustment boolean from Entitlements. */
  planAdjustmentLimit?: number;
  personalizedAiEnabled: boolean;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planCode: 'free' | 'pro';
  planName: string;
  status: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  billingInterval?: 'monthly' | 'annual';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface Entitlements {
  planCode: 'free' | 'pro';
  status: string;
  activeGoalLimit?: number;
  activeHabitLimit?: number;
  weeklyReviewHistoryLimit?: number;
  planAdjustmentLimit?: number;
  personalizedAiEnabled: boolean;
  canCreateGoal: boolean;
  canCreateHabit: boolean;
  canViewWeeklyReviewHistory: boolean;
  canUsePersonalizedAi: boolean;
  canCreatePlanAdjustment: boolean;
  currentActiveGoals: number;
  currentActiveHabits: number;
  currentPendingAdjustments: number;
}

export interface BillingOverview {
  plans: Plan[];
  subscription: UserSubscription;
  entitlements: Entitlements;
  billingMode: 'disabled' | 'fake_door' | 'stripe_test' | 'stripe_live';
}

export type UpgradeEventType = 'prompt_viewed' | 'prompt_clicked' | 'prompt_dismissed' | 'checkout_started' | 'checkout_completed' | 'checkout_canceled';

export type UpgradeSurface = 'pricing_page' | 'settings_billing' | 'goal_create_limit' | 'habit_create_limit' | 'weekly_review_history' | 'assistant_personalization' | 'plan_adjustments' | 'weekly_review_value_moment';

export type UpgradeTrigger = 'goal_limit' | 'habit_limit' | 'weekly_history' | 'personalized_ai' | 'plan_adjustments';

export interface UpgradeEventRequest {
  eventType: UpgradeEventType;
  surface: UpgradeSurface;
  trigger?: UpgradeTrigger;
  planCode?: string;
  billingInterval?: 'monthly' | 'annual';
  feedbackReason?: string;
  feedbackNote?: string;
  /** JSON-serialized metadata string. The gateway contract expects `metadataJson` as a string field. */
  metadataJson?: string;
}

export type BillingOverviewResponse = ApiResponse<BillingOverview>;
export type UpgradeEventResponse = ApiResponse<{ eventId: string }>;
export type CheckoutSessionResponse = ApiResponse<{ checkoutUrl: string }>;
export type PortalSessionResponse = ApiResponse<{ portalUrl: string }>;

export interface PlanLimitError {
  code: 'plan_limit_reached';
  message: string;
  limit: 'active_goals' | 'active_habits' | 'weekly_review_history' | 'plan_adjustments' | 'personalized_ai';
  upgradeTrigger: UpgradeTrigger;
}
