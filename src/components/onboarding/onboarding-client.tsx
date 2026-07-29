'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks';
import { useOnboardingStore, TOTAL_STEPS } from '@/store/onboarding';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';

import { StepHeader } from './shared';
import { useHabitGeneration } from './use-habit-generation';
import { useOnboardingSubmission } from './use-onboarding-submission';
import { GoalStep } from './steps/goal-step';
import { MotivationStep } from './steps/motivation-step';
import { BlockerStep } from './steps/blocker-step';
import { CommitmentStep } from './steps/commitment-step';
import { AccountabilityStep } from './steps/accountability-step';
import { CheckInStep } from './steps/check-in-step';
import { HabitSummaryStep } from './steps/habit-summary-step';

// ─── Main wizard ─────────────────────────────────────────────────────────────

export function OnboardingClient() {
  const router = useRouter();
  const step = useOnboardingStore((s) => s.step);
  const state = useOnboardingStore((s) => s.data);
  const loadingHabits = useOnboardingStore((s) => s.loadingHabits);
  const error = useOnboardingStore((s) => s.error);
  const updateField = useOnboardingStore((s) => s.updateField);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const toggleHabitSelection = useOnboardingStore((s) => s.toggleHabitSelection);
  const reset = useOnboardingStore((s) => s.reset);

  const { data: categories = [] } = useCategories('goal');

  const { generateHabits } = useHabitGeneration();
  const { isSubmitting, handleFinish } = useOnboardingSubmission();

  const update = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    updateField(key, value);
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

  const handleSkip = () => {
    reset();
    router.push('/plan');
  };

  // ─── Render steps ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="relative w-full max-w-lg">
        <StepHeader step={step} total={TOTAL_STEPS} />

        <div className="bg-card border border-border rounded-xl p-8">
          {/* Step 1: Goal title + category */}
          {step === 1 && (
            <GoalStep
              goalTitle={state.goalTitle}
              goalCategory={state.goalCategory}
              update={update}
              categories={categories}
            />
          )}

          {/* Step 2: Motivation */}
          {step === 2 && (
            <MotivationStep
              motivation={state.motivation}
              update={update}
            />
          )}

          {/* Step 3: Blockers */}
          {step === 3 && (
            <BlockerStep
              blocker={state.blocker}
              update={update}
            />
          )}

          {/* Step 4: Daily time commitment */}
          {step === 4 && (
            <CommitmentStep
              dailyMinutes={state.dailyMinutes}
              update={update}
            />
          )}

          {/* Step 5: Accountability style */}
          {step === 5 && (
            <AccountabilityStep
              accountabilityStyle={state.accountabilityStyle}
              update={update}
            />
          )}

          {/* Step 6: Check-in time */}
          {step === 6 && (
            <CheckInStep
              checkInTime={state.checkInTime}
              update={update}
            />
          )}

          {/* Step 7: AI habit suggestions (summary) */}
          {step === 7 && (
            <HabitSummaryStep
              state={state}
              loadingHabits={loadingHabits}
              error={error}
              toggleHabitSelection={toggleHabitSelection}
            />
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {/* Left: Skip (step 1) or Back */}
            {step === 1 ? (
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip setup
              </button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={isSubmitting}
                className="text-muted-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}

            {step < TOTAL_STEPS ? (
              <Button
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
                onClick={handleFinish}
                disabled={!canProceed() || isSubmitting || loadingHabits}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                ) : (
                  <>Start tomorrow morning <Check className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>

        {step < TOTAL_STEPS && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            You can change all of these preferences later in Settings.
          </p>
        )}
      </div>
    </div>
  );
}
