import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const PageParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
}).catchall(z.union([z.string(), z.number(), z.boolean(), z.undefined()]));

export const PageResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    page: PageResponseSchema.optional(),
  });
}

// ============================================
// Auth Schemas
// ============================================

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterRequestSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .regex(/^[a-z][a-z0-9_-]*$/, 'Username must be lowercase, start with a letter, and only contain letters, numbers, underscores, or hyphens'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
});

export const ProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  username: z.string(),
  email: z.string(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  interests: z.array(z.string()).nullable().optional().transform((v) => v ?? []),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  emailVerified: z.boolean().optional(),
});

export const ProfileResponseSchema = ApiResponseSchema(ProfileSchema);

export const UpdateProfileRequestSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(200).optional(),
  interests: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
  user: ProfileSchema,
});

export const RegisterResponseSchema = z.object({
  requiresVerification: z.boolean(),
  message: z.string(),
});

export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const ResendVerificationRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// ============================================
// Goal Schemas
// ============================================

export const GoalCategorySchema = z.string().min(1).max(50);

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  // The raw category slug from the DB. May be an empty string or an unknown
  // slug if the goal's category_id is missing/unrecognized — surfaced rather
  // than masked.
  category: z.string(),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100),
  completed: z.boolean(),
  relatedHabitIds: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.array(z.string()).optional()
  ),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateGoalRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000),
  category: GoalCategorySchema,
  dueDate: z.string().optional(),
  relatedHabitIds: z.array(z.string()).optional(),
});

export const UpdateGoalRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: GoalCategorySchema.optional(),
  dueDate: z.string().optional(),
  relatedHabitIds: z.array(z.string()).optional(),
});

export const UpdateGoalProgressRequestSchema = z.object({
  progress: z.number().min(0).max(100),
});

export const GoalsResponseSchema = ApiResponseSchema(z.array(GoalSchema)).extend({
  page: PageResponseSchema,
});

export const GoalResponseSchema = ApiResponseSchema(GoalSchema);

// ============================================
// Habit Schemas
// ============================================

// Category slugs are driven by the `categories` table in the DB, not a
// hardcoded frontend enum — the DB is the source of truth and new categories
// can be added without a frontend deploy. Validate that it's a non-empty
// slug string on the write side; the DB FK enforces existence.
export const HabitCategorySchema = z.string().min(1).max(50);

export const HabitSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  streak: z.number().int().nonnegative(),
  completed: z.boolean(),
  // Accept the raw category slug from the DB. An empty string (from a NULL
  // category_id LEFT JOIN) is surfaced to the UI as "uncategorized" instead of
  // being masked.
  category: z.string(),
  userId: z.string(),
  // The Go backend serializes unset `[]bool` fields as `null` (go-zero's
  // `optional` tag is not `omitempty`). Normalize null → undefined so the
  // parsed type stays `boolean[] | undefined`.
  recentHistory: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.array(z.boolean()).optional(),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateHabitRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000),
  category: HabitCategorySchema,
});

export const UpdateHabitRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: HabitCategorySchema.optional(),
});

export const HabitsResponseSchema = ApiResponseSchema(z.array(HabitSchema)).extend({
  page: PageResponseSchema,
});

export const HabitResponseSchema = ApiResponseSchema(HabitSchema);

// ============================================
// Check-In Schemas
// ============================================

export const CheckInStatusSchema = z.enum(['completed', 'missed']);
export const CheckInMoodSchema = z.enum(['great', 'okay', 'low', 'stressed']);
export const CheckInEnergySchema = z.enum(['high', 'medium', 'low']);
export const CheckInBlockerSchema = z.enum(['lack_of_time', 'low_motivation', 'too_distracted', 'unclear_plan', 'other']);

// The Go backend serializes unset optional enum fields as empty strings ("")
// because go-zero's `optional` struct tag is not `omitempty`. Normalize "" to
// undefined so Zod's enum schemas accept the response.
const optionalEnum = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

export const CheckInSchema = z.object({
  id: z.string(),
  userId: z.string(),
  habitId: z.string(),
  status: CheckInStatusSchema,
  mood: optionalEnum(CheckInMoodSchema),
  energy: optionalEnum(CheckInEnergySchema),
  blocker: optionalEnum(CheckInBlockerSchema),
  note: z.string().max(2000).optional(),
  createdAt: z.string(),
});

export const CreateCheckInRequestSchema = z.object({
  habitId: z.string(),
  status: CheckInStatusSchema,
  mood: CheckInMoodSchema.optional(),
  energy: CheckInEnergySchema.optional(),
  blocker: CheckInBlockerSchema.optional(),
  note: z.string().max(2000).optional(),
});

export const CreateCheckInResponseDataSchema = z.object({
  checkIn: CheckInSchema,
  habit: HabitSchema,
  aiFeedback: z.string().optional(),
});

// The backend returns { checkIns: [...] } for today/history endpoints, not
// { data: [...] }. Accept both shapes and normalize to { data: [...] }.
export const CheckInsResponseSchema = z.union([
  ApiResponseSchema(z.array(CheckInSchema)),
  z.object({ checkIns: z.array(CheckInSchema) }).transform((v) => ({ data: v.checkIns })),
]);
export const CheckInResponseSchema = ApiResponseSchema(CheckInSchema);

// ============================================
// Article Schemas
// ============================================

export const ArticleCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  category: ArticleCategorySchema.optional(),
  readTime: z.number().int().nonnegative(),
  imageUrl: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isSaved: z.boolean().optional(),
  likeCount: z.number().int().nonnegative().optional(),
  isLiked: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const ArticlesResponseSchema = ApiResponseSchema(z.array(ArticleSchema)).extend({
  page: PageResponseSchema,
});

export const ArticleResponseSchema = ApiResponseSchema(ArticleSchema);

export const ListArticlesParamsSchema = PageParamsSchema.extend({
  category: z.string().optional(),
});

export const LikeArticleResponseSchema = z.object({
  success: z.boolean(),
  newLikeCount: z.number().int(),
  isLiked: z.boolean(),
});

export const ShareArticleResponseSchema = z.object({
  success: z.boolean(),
});

// ============================================
// Activity Schemas
// ============================================

export const ActivityTypeSchema = z.enum([
  'habit_completed', 'goal_created', 'goal_completed', 'article_saved',
  'check_in_completed', 'check_in_missed', 'weekly_review_generated',
]);

export const ActivitySchema = z.object({
  id: z.string(),
  type: ActivityTypeSchema,
  title: z.string(),
  description: z.string(),
  metadata: z.string().optional(),
  userId: z.string(),
  createdAt: z.string(),
});

export const ActivityResponseSchema = ApiResponseSchema(z.array(ActivitySchema)).extend({
  page: PageResponseSchema,
});

// ============================================
// Conversation Schemas
// ============================================

export const ConversationTypeSchema = z.enum(['coach', 'therapist']);
export const MessageRoleSchema = z.enum(['user', 'assistant']);

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: MessageRoleSchema,
  conversationId: z.string(),
  createdAt: z.string(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: ConversationTypeSchema,
  lastMessage: z.string(),
  userId: z.string(),
  archived: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ConversationDetailSchema = ConversationSchema.extend({
  messages: z.array(MessageSchema),
});

export const StartConversationRequestSchema = z.object({
  type: ConversationTypeSchema.optional(),
  title: z.string().optional(),
  initialMessage: z.string().optional(),
});

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

export const ConversationsResponseSchema = ApiResponseSchema(z.array(ConversationSchema)).extend({
  page: PageResponseSchema,
});

export const ConversationResponseSchema = ApiResponseSchema(ConversationSchema);
export const ConversationDetailResponseSchema = ApiResponseSchema(ConversationDetailSchema);

export const MessagesResponseSchema = ApiResponseSchema(z.array(MessageSchema)).extend({
  page: PageResponseSchema,
});

export const MessageResponseSchema = ApiResponseSchema(MessageSchema);

// ============================================
// Settings Schemas
// ============================================

export const SettingsSchema = z.object({
  id: z.string(),
  // go-zero serializes unset optional enum fields as "" — coerce to the DB default.
  theme: z.preprocess(
    (v) => (v === '' ? 'system' : v),
    z.enum(['light', 'dark', 'system']),
  ),
  language: z.string(),
  timezone: z.string(),
  accountabilityStyle: z.preprocess(
    (v) => (v === '' ? 'balanced' : v),
    z.enum(['gentle', 'balanced', 'strict']),
  ),
  checkInTime: z.string(),
  onboardingCompleted: z.boolean(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UpdateSettingsRequestSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  accountabilityStyle: z.enum(['gentle', 'balanced', 'strict']).optional(),
  checkInTime: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export const SettingsResponseSchema = ApiResponseSchema(SettingsSchema);

export const NotificationPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  habitRemindersEnabled: z.boolean(),
  goalRemindersEnabled: z.boolean(),
});

export const NotificationPreferencesResponseSchema = z.object({
  preferences: NotificationPreferencesSchema,
});

export const UpdateNotificationPreferencesRequestSchema = z.object({
  preferences: NotificationPreferencesSchema,
});

export const UnreadNotificationCountResponseSchema = z.object({
  count: z.number(),
});

// ============================================
// Notification Schemas
// ============================================

export const NotificationTypeSchema = z.enum([
  'habit_reminder', 'goal_deadline', 'achievement', 'system',
  'missed_check_in', 'weekly_review', 'encouragement', 'ai_feedback',
]);

export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: NotificationTypeSchema,
  read: z.boolean(),
  userId: z.string(),
  createdAt: z.string(),
});

export const NotificationsResponseSchema = ApiResponseSchema(z.array(NotificationSchema)).extend({
  page: PageResponseSchema,
});

// ============================================
// Search Schemas
// ============================================

export const SearchResultTypeSchema = z.enum(['article', 'goal', 'habit', 'conversation']);

export const SearchResultSchema = z.object({
  id: z.string(),
  type: SearchResultTypeSchema,
  title: z.string(),
  description: z.string(),
  score: z.number(),
  highlight: z.string().optional(),
});

export const SearchResponseSchema = ApiResponseSchema(z.array(SearchResultSchema)).extend({
  page: PageResponseSchema,
});

export const SearchParamsSchema = PageParamsSchema.extend({
  q: z.string().min(1).max(200),
  type: SearchResultTypeSchema.optional(),
});

// ============================================
// Saved Items Schemas
// ============================================

export const SavedItemTypeSchema = z.enum(['article', 'goal', 'habit']);

export const SavedItemSchema = z.object({
  id: z.string(),
  itemType: SavedItemTypeSchema,
  itemId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
});

export const SaveItemRequestSchema = z.object({
  itemType: SavedItemTypeSchema,
  itemId: z.string(),
});

export const SavedItemsResponseSchema = ApiResponseSchema(z.array(SavedItemSchema)).extend({
  page: PageResponseSchema,
});

export const SavedItemResponseSchema = ApiResponseSchema(SavedItemSchema);

export const SavedItemDetailedSchema = SavedItemSchema.extend({
  article: ArticleSchema.optional(),
  habit: HabitSchema.optional(),
  goal: GoalSchema.optional(),
});

export const SavedItemsDetailedResponseSchema = ApiResponseSchema(z.array(SavedItemDetailedSchema)).extend({
  page: PageResponseSchema,
});

// ============================================
// Report Schemas
// ============================================

export const ReportTypeSchema = z.enum(['bug', 'feedback', 'abuse']);

export const ReportRequestSchema = z.object({
  type: ReportTypeSchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  email: z.string().email().optional(),
});

// ============================================
// Category Schemas
// ============================================

export const EntityTypeSchema = z.enum(['article', 'habit', 'goal']);

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  entityType: EntityTypeSchema.optional().or(z.literal('').transform(() => undefined)),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CategoriesResponseSchema = ApiResponseSchema(z.array(CategorySchema));

// ============================================
// Personalization Schemas
// ============================================

export const AccountabilityStyleSchema = z.enum(['gentle', 'balanced', 'strict']);
export const PreferredToneSchema = z.enum(['supportive', 'direct', 'warm', 'practical', 'challenging']);
export const DifficultyPreferenceSchema = z.enum(['easy', 'adaptive', 'ambitious']);
export const AdjustmentTypeSchema = z.enum(['reduce_difficulty', 'increase_difficulty', 'change_time', 'clarify_plan', 'pause', 'keep_same']);
export const SuggestionStatusSchema = z.enum(['pending', 'accepted', 'dismissed', 'applied']);
export const SuggestionSourceSchema = z.enum(['check_in', 'weekly_review', 'assistant', 'pattern_analysis']);

export const CoachingProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  // go-zero serializes unset optional enum fields as "" — coerce to the DB default.
  accountabilityStyle: z.preprocess(
    (v) => (v === '' ? 'balanced' : v),
    AccountabilityStyleSchema,
  ),
  preferredTone: z.preprocess(
    (v) => (v === '' ? 'supportive' : v),
    PreferredToneSchema,
  ),
  difficultyPreference: z.preprocess(
    (v) => (v === '' ? 'adaptive' : v),
    DifficultyPreferenceSchema,
  ),
  primaryMotivation: z.string().optional(),
  commonBlockers: z.array(z.string()),
  coachingNotes: z.record(z.unknown()),
  lastContextRefreshAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PlanAdjustmentSuggestionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalId: z.string().optional(),
  habitId: z.string().optional(),
  source: SuggestionSourceSchema,
  adjustmentType: AdjustmentTypeSchema,
  reason: z.string(),
  suggestion: z.string(),
  status: SuggestionStatusSchema,
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PersonalizationContextSchema = z.object({
  profile: CoachingProfileSchema,
  activeGoals: z.array(GoalSchema),
  activeHabits: z.array(HabitSchema),
  recentCheckIns: z.array(CheckInSchema),
  latestWeeklyReview: z.lazy(() => WeeklyReviewSchema).optional(),
  pendingSuggestions: z.array(PlanAdjustmentSuggestionSchema),
  patternInsights: z.record(z.string()),
});

export const UpdateCoachingProfilePreferencesRequestSchema = z.object({
  accountabilityStyle: AccountabilityStyleSchema,
  preferredTone: PreferredToneSchema,
  difficultyPreference: DifficultyPreferenceSchema,
});

export const CreatePlanAdjustmentSuggestionRequestSchema = z.object({
  goalId: z.string().optional(),
  habitId: z.string().optional(),
  source: SuggestionSourceSchema,
  adjustmentType: AdjustmentTypeSchema,
  reason: z.string(),
  suggestion: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdatePlanAdjustmentSuggestionStatusRequestSchema = z.object({
  status: SuggestionStatusSchema,
});

export const ApplyPlanAdjustmentSuggestionRequestSchema = z.object({
  id: z.string(),
});

export const GeneratePersonalizedCoachingRequestSchema = z.object({
  userMessage: z.string().min(1).max(5000),
  context: z.string().optional(),
});

export const GeneratePersonalizedCoachingResponseSchema = z.object({
  coachingResponse: z.string(),
  context: z.string().optional(),
});

export const CoachingProfileResponseSchema = ApiResponseSchema(CoachingProfileSchema);
export const PersonalizationContextResponseSchema = ApiResponseSchema(PersonalizationContextSchema);
export const PlanAdjustmentSuggestionsResponseSchema = ApiResponseSchema(z.array(PlanAdjustmentSuggestionSchema)).extend({
  total: z.number().int(),
});
export const PlanAdjustmentSuggestionResponseSchema = ApiResponseSchema(PlanAdjustmentSuggestionSchema);
export const PersonalizedCoachingResponseSchema = ApiResponseSchema(GeneratePersonalizedCoachingResponseSchema);

// ============================================
// Onboarding Habit Generation Schemas
// ============================================

export const GenerateOnboardingHabitsRequestSchema = z.object({
  goalTitle: z.string().min(1).max(200),
  goalCategory: z.string().max(100).optional(),
  motivation: z.string().max(500).optional(),
  blocker: z.string().max(500).optional(),
  dailyMinutes: z.number().int().min(1).max(600),
  accountabilityStyle: z.enum(['gentle', 'balanced', 'strict']).optional(),
});

export const OnboardingHabitSuggestionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const GenerateOnboardingHabitsResponseSchema = ApiResponseSchema(z.array(OnboardingHabitSuggestionSchema));

// ============================================
// Weekly Review Schemas
// ============================================

export const WeeklyReviewAdjustmentTypeSchema = z.enum([
  'keep_same', 'reduce_difficulty', 'change_time', 'clarify_plan', 'pause_habit',
]);

export const WeeklyReviewHabitBreakdownSchema = z.object({
  habitId: z.string(),
  habitName: z.string(),
  category: z.string().optional(),
  totalCheckIns: z.number().int(),
  completedCount: z.number().int(),
  missedCount: z.number().int(),
  completionRate: z.number(),
  lastCheckInAt: z.string().optional(),
});

export const WeeklyReviewAdjustmentSchema = z.object({
  habitId: z.string().optional(),
  habitName: z.string(),
  adjustmentType: WeeklyReviewAdjustmentTypeSchema,
  reason: z.string(),
  suggestion: z.string(),
});

export const WeeklyReviewNextWeekPlanSchema = z.object({
  focus: z.string(),
  commitments: z.array(z.string()),
  risks: z.array(z.string()),
  recoveryActions: z.array(z.string()),
});

export const WeeklyReviewSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  weekStart: z.string(),
  weekEnd: z.string(),
  totalHabits: z.number().int(),
  completedCheckIns: z.number().int(),
  missedCheckIns: z.number().int(),
  completionRate: z.number(),
  bestDay: z.string().optional(),
  hardestDay: z.string().optional(),
  topBlocker: z.string().optional(),
  moodSummary: z.record(z.number()),
  energySummary: z.record(z.number()),
  habitBreakdown: z.array(WeeklyReviewHabitBreakdownSchema),
  aiSummary: z.string().optional(),
  suggestedAdjustments: z.array(WeeklyReviewAdjustmentSchema),
  nextWeekPlan: WeeklyReviewNextWeekPlanSchema,
  generatedAt: z.string(),
});

export const WeeklyReviewResponseSchema = ApiResponseSchema(WeeklyReviewSchema);
export const WeeklyReviewsResponseSchema = ApiResponseSchema(z.array(WeeklyReviewSchema)).extend({
  page: PageResponseSchema,
});

// ============================================
// Billing Schemas
// ============================================

export const PlanSchema = z.object({
  id: z.string(),
  code: z.enum(['free', 'pro']),
  name: z.string(),
  description: z.string().optional(),
  priceMonthlyCents: z.number().int(),
  priceAnnualCents: z.number().int(),
  activeGoalLimit: z.number().int().optional(),
  activeHabitLimit: z.number().int().optional(),
  weeklyReviewHistoryLimit: z.number().int().optional(),
  planAdjustmentLimit: z.number().int().optional(),
  personalizedAiEnabled: z.boolean(),
  isActive: z.boolean(),
});

export const UserSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  planCode: z.enum(['free', 'pro']),
  planName: z.string(),
  status: z.enum(['free', 'trialing', 'active', 'past_due', 'canceled', 'expired']),
  // Backend sends "" for unset optional fields (go-zero JSON marshaling);
  // accept empty string and treat it as absent via .transform.
  billingInterval: z.union([z.enum(['monthly', 'annual']), z.literal('')]).optional().transform((v) => (v === '' ? undefined : v)),
  currentPeriodStart: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  trialEnd: z.string().optional(),
  cancelAtPeriodEnd: z.boolean(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

export const EntitlementsSchema = z.object({
  planCode: z.enum(['free', 'pro']),
  status: z.string(),
  activeGoalLimit: z.number().int().optional(),
  activeHabitLimit: z.number().int().optional(),
  weeklyReviewHistoryLimit: z.number().int().optional(),
  planAdjustmentLimit: z.number().int().optional(),
  personalizedAiEnabled: z.boolean(),
  canCreateGoal: z.boolean(),
  canCreateHabit: z.boolean(),
  canViewWeeklyReviewHistory: z.boolean(),
  canUsePersonalizedAi: z.boolean(),
  canCreatePlanAdjustment: z.boolean(),
  currentActiveGoals: z.number().int(),
  currentActiveHabits: z.number().int(),
  currentPendingAdjustments: z.number().int(),
});

export const BillingOverviewSchema = z.object({
  plans: z.array(PlanSchema),
  subscription: UserSubscriptionSchema,
  entitlements: EntitlementsSchema,
  billingMode: z.enum(['disabled', 'fake_door', 'stripe_test', 'stripe_live']),
});

export const UpgradeEventTypeSchema = z.enum([
  'prompt_viewed', 'prompt_clicked', 'prompt_dismissed',
  'checkout_started', 'checkout_completed', 'checkout_canceled',
]);

export const UpgradeSurfaceSchema = z.enum([
  'pricing_page', 'settings_billing', 'goal_create_limit', 'habit_create_limit',
  'weekly_review_history', 'assistant_personalization', 'plan_adjustments', 'weekly_review_value_moment',
]);

export const UpgradeTriggerSchema = z.enum([
  'goal_limit', 'habit_limit', 'weekly_history', 'personalized_ai', 'plan_adjustments',
]);

export const UpgradeEventRequestSchema = z.object({
  eventType: UpgradeEventTypeSchema,
  surface: UpgradeSurfaceSchema,
  trigger: UpgradeTriggerSchema.optional(),
  planCode: z.string().optional(),
  billingInterval: z.enum(['monthly', 'annual']).optional(),
  feedbackReason: z.string().optional(),
  feedbackNote: z.string().optional(),
  metadataJson: z.string().optional(),
});

// The billing endpoints return flat response bodies (no `data` envelope),
// matching the gateway contract in services/gateway/contract/types.api.
export const BillingOverviewResponseSchema = BillingOverviewSchema;
export const UpgradeEventResponseSchema = z.object({ eventId: z.string() });
export const CheckoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().optional(),
  sessionId: z.string().optional(),
});
export const PortalSessionResponseSchema = z.object({ portalUrl: z.string().optional() });

export const PlanLimitErrorSchema = z.object({
  code: z.literal('plan_limit_reached'),
  message: z.string(),
  limit: z.enum(['active_goals', 'active_habits', 'weekly_review_history', 'plan_adjustments', 'personalized_ai']),
  upgradeTrigger: UpgradeTriggerSchema,
});

// ============================================
// Chat API Route Schemas
// ============================================

export const ChatRequestSchema = z.object({
  messages: z.array(z.any()).min(1).max(50),
  system: z.string().max(5000).optional(),
  tools: z.record(z.any()).optional(),
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

// ============================================
// Site Settings Schemas
// ============================================

export const SiteSettingItemSchema = z.object({
  key: z.string(),
  value: z.string(),
  updatedAt: z.string(),
});

export const SiteSettingsResponseSchema = ApiResponseSchema(z.array(SiteSettingItemSchema));

// ============================================
// Template Schemas
// ============================================

export const TemplateCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const HabitTemplateItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(""),
  category: TemplateCategorySchema.nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GoalTemplateItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  category: TemplateCategorySchema.nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const HabitTemplatesResponseSchema = z.object({
  data: z.array(HabitTemplateItemSchema),
});

export const GoalTemplatesResponseSchema = z.object({
  data: z.array(GoalTemplateItemSchema),
});
