'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createGoal, createHabit, updateSettings } from '@/api';
import {
  GOAL_CATEGORIES,
  ACCOUNTABILITY_STYLES,
  ACCOUNTABILITY_STYLE_LABELS,
  ACCOUNTABILITY_STYLE_DESCRIPTIONS,
  ACCOUNTABILITY_STYLE_TONES,
  CHECK_IN_HOURS,
  DAILY_COMMITMENT_OPTIONS,
} from '@/lib/constants';
import { useOnboardingStore, TOTAL_STEPS } from '@/store/onboarding';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';

// ─── Step header component ────────────────────────────────────────────────────

function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < step ? 'bg-primary' : i === step - 1 ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Step {step} of {total}
      </p>
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const step = useOnboardingStore((s) => s.step);
  const state = useOnboardingStore((s) => s.data);
  const loadingHabits = useOnboardingStore((s) => s.loadingHabits);
  const error = useOnboardingStore((s) => s.error);
  const updateField = useOnboardingStore((s) => s.updateField);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const setLoadingHabits = useOnboardingStore((s) => s.setLoadingHabits);
  const setError = useOnboardingStore((s) => s.setError);
  const setHabitSuggestions = useOnboardingStore((s) => s.setHabitSuggestions);
  const toggleHabitSelection = useOnboardingStore((s) => s.toggleHabitSelection);

  const update = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    updateField(key, value);
  };

  // ─── Habit AI generation ─────────────────────────────────────────────────

  const generateHabits = async () => {
    setLoadingHabits(true);
    setError(null);
    try {
      const systemPrompt = `You are an AI accountability coach. Generate exactly 3 specific, small, actionable daily habits for a user.

User context:
- Goal: ${state.goalTitle} (category: ${state.goalCategory})
- Motivation: ${state.motivation}
- Main blocker: ${state.blocker}
- Daily time available: ${state.dailyMinutes} minutes
- Accountability style: ${state.accountabilityStyle}

Rules:
- Each habit must fit within ${state.dailyMinutes} minutes total combined
- Habits must be small enough to do even on low-motivation days
- Be specific (not "exercise more" but "walk for 15 minutes after lunch")
- Return exactly this JSON format, no extra text:
[
  {"name": "Habit name", "description": "One sentence describing when/how to do it"},
  {"name": "Habit name", "description": "One sentence describing when/how to do it"},
  {"name": "Habit name", "description": "One sentence describing when/how to do it"}
]`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              id: 'onboarding-habits',
              role: 'user',
              content: 'Generate 3 daily habits for my goal.',
              parts: [{ type: 'text', text: 'Generate 3 daily habits for my goal.' }],
            },
          ],
          system: systemPrompt,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate habits');

      const text = await response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Could not parse habit suggestions');

      const parsed: Array<{ name: string; description: string }> = JSON.parse(jsonMatch[0]);
      const suggestions = parsed.slice(0, 3).map((h) => ({
        name: h.name,
        description: h.description,
        selected: true,
      }));

      setHabitSuggestions(suggestions);
    } catch {
      const fallback = [
        {
          name: `Work on ${state.goalTitle} for ${Math.round(state.dailyMinutes / 3)} minutes`,
          description: 'Set a timer and focus exclusively on this task.',
          selected: true,
        },
        {
          name: 'Review your plan for tomorrow',
          description: 'Spend 5 minutes each evening reviewing what you will do next.',
          selected: true,
        },
        {
          name: 'Track your progress',
          description: 'Write one sentence about what you accomplished today.',
          selected: true,
        },
      ];
      setHabitSuggestions(fallback);
    } finally {
      setLoadingHabits(false);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const { mutateAsync: doCreateGoal, isPending: creatingGoal } = useMutation({
    mutationFn: createGoal,
  });
  const { mutateAsync: doCreateHabit, isPending: creatingHabit } = useMutation({
    mutationFn: ({ name, description, category }: Parameters<typeof createHabit>[0]) =>
      createHabit({ name, description, category }),
  });
  const { mutateAsync: doUpdateSettings, isPending: updatingSettings } = useMutation({
    mutationFn: updateSettings,
  });

  const isSubmitting = creatingGoal || creatingHabit || updatingSettings;

  const handleFinish = async () => {
    setError(null);
    try {
      await doCreateGoal({
        title: state.goalTitle,
        description: state.motivation
          ? `Goal: ${state.goalTitle}. Motivation: ${state.motivation}`
          : state.goalTitle,
        category: state.goalCategory,
      });

      const selectedHabits = state.habitSuggestions.filter((h) => h.selected);
      await Promise.all(
        selectedHabits.map((habit) =>
          doCreateHabit({
            name: habit.name,
            description: habit.description,
            category: state.goalCategory,
          })
        )
      );

      await doUpdateSettings({
        accountabilityStyle: state.accountabilityStyle,
        checkInTime: state.checkInTime,
        onboardingCompleted: true,
      });

      router.push('/habits');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  // ─── Navigation ──────────────────────────────────────────────────────────

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return state.goalTitle.trim().length >= 3;
      case 2: return state.motivation.trim().length >= 3;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      case 6: return true;
      case 7: return state.habitSuggestions.some((h) => h.selected);
      default: return true;
    }
  };

  const handleNext = async () => {
    if (step === 6) {
      await generateHabits();
    }
    nextStep();
  };

  // ─── Render steps ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-ambient-energy opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-ambient-growth opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <StepHeader step={step} total={TOTAL_STEPS} />

        <div className="bg-card border border-border/60 rounded-2xl shadow-xl p-8">
          {/* Step 1: Goal title + category */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  What do you want to work on?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start with one clear goal. You can add more later.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your goal</label>
                  <Input
                    placeholder="e.g. Study consistently for my exams"
                    value={state.goalTitle}
                    onChange={(e) => update('goalTitle', e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GOAL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => update('goalCategory', cat)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
                          state.goalCategory === cat
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/60 bg-background hover:border-border hover:bg-muted/40'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Motivation */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  Why does this matter to you?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Understanding your &ldquo;why&rdquo; makes it easier to stay consistent when motivation dips.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your motivation</label>
                <Textarea
                  placeholder="e.g. I want to feel confident in my exams and prove to myself I can be disciplined."
                  value={state.motivation}
                  onChange={(e) => update('motivation', e.target.value)}
                  rows={4}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3: Blockers */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  What usually stops you?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Knowing your main obstacle helps me give you more useful coaching.
                </p>
              </div>
              <div className="space-y-3">
                {['Lack of time', 'Low motivation', 'Too distracted', 'Unclear plan', 'Other'].map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => update('blocker', option === state.blocker ? '' : option)}
                      className={cn(
                        'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
                        state.blocker === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 bg-background hover:border-border hover:bg-muted/40'
                      )}
                    >
                      {option}
                    </button>
                  )
                )}
                {state.blocker === 'Other' && (
                  <Input
                    placeholder="Describe your main blocker..."
                    autoFocus
                    onChange={(e) => update('blocker', e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 4: Daily time commitment */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  How much time can you commit daily?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be realistic. A small habit done consistently beats a big one abandoned.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {DAILY_COMMITMENT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('dailyMinutes', value)}
                    className={cn(
                      'rounded-lg border px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
                      state.dailyMinutes === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 bg-background hover:border-border hover:bg-muted/40'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Accountability style */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  How should I hold you accountable?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose the coaching style that works best for you.
                </p>
              </div>
              <div className="space-y-3">
                {ACCOUNTABILITY_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => update('accountabilityStyle', style)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
                      state.accountabilityStyle === style
                        ? 'border-primary bg-primary/10'
                        : 'border-border/60 bg-background hover:border-border hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">
                        {ACCOUNTABILITY_STYLE_LABELS[style]}
                      </span>
                      {state.accountabilityStyle === style && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ACCOUNTABILITY_STYLE_DESCRIPTIONS[style]}
                    </p>
                    <p className="text-xs italic text-muted-foreground/80 border-t border-border/40 pt-2 mt-2">
                      &ldquo;{ACCOUNTABILITY_STYLE_TONES[style]}&rdquo;
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Check-in time */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  When should I check in with you?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pick the time you are most likely to reflect on your day.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily check-in time</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CHECK_IN_HOURS.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => update('checkInTime', hour)}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
                        state.checkInTime === hour
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 bg-background hover:border-border hover:bg-muted/40'
                      )}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: AI habit suggestions */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    Here&apos;s your plan
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  I&apos;ve suggested 3 daily habits to get you started. Uncheck any you don&apos;t want.
                </p>
              </div>

              {loadingHabits ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Building your habit plan...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.habitSuggestions.map((habit, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleHabitSelection(idx)}
                      className={cn(
                        'w-full rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
                        habit.selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border/60 bg-background opacity-60'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                            habit.selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40'
                          )}
                          aria-hidden="true"
                        >
                          {habit.selected && <Check className="h-3 w-3" aria-hidden="true" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{habit.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <span className="font-medium">Your plan: </span>
                {state.goalTitle} · {state.dailyMinutes} min/day ·{' '}
                {ACCOUNTABILITY_STYLE_LABELS[state.accountabilityStyle]} accountability ·
                Check-in at {state.checkInTime}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className={cn(step === 1 && 'invisible')}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button
                variant="energy"
                onClick={handleNext}
                disabled={!canProceed() || loadingHabits}
                className="min-w-[120px]"
              >
                {loadingHabits ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building plan...</>
                ) : (
                  <>Continue <ArrowRight className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            ) : (
              <Button
                variant="energy"
                onClick={handleFinish}
                disabled={!canProceed() || isSubmitting || loadingHabits}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                ) : (
                  <>Start my plan <Check className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          You can change all of these preferences later in Settings.
        </p>
      </div>
    </div>
  );
}
