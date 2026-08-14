"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Smile, Meh, Frown, AlertTriangle, Zap, Battery, BatteryLow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit, CheckInMood, CheckInEnergy, CheckInBlocker } from "@/api";
import { useCheckInForm } from "@/hooks";

export type CheckInSubmitData = {
  habitId: string;
  status: 'completed' | 'missed';
  mood?: CheckInMood;
  energy?: CheckInEnergy;
  blocker?: CheckInBlocker;
  note?: string;
};

export type CheckInModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
  onSubmit: (data: CheckInSubmitData) => void;
  isSubmitting?: boolean;
};

const MOOD_OPTIONS: { value: CheckInMood; label: string; icon: LucideIcon; color: string }[] = [
  { value: 'great', label: 'Great', icon: Smile, color: 'bg-success/10 text-success hover:bg-success/20' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'bg-accent/10 text-accent hover:bg-accent/20' },
  { value: 'low', label: 'Low', icon: Frown, color: 'bg-primary/10 text-primary hover:bg-primary/20' },
  { value: 'stressed', label: 'Stressed', icon: AlertTriangle, color: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
];

const ENERGY_OPTIONS: { value: CheckInEnergy; label: string; icon: LucideIcon; color: string }[] = [
  { value: 'high', label: 'High', icon: Zap, color: 'bg-success/10 text-success hover:bg-success/20' },
  { value: 'medium', label: 'Medium', icon: Battery, color: 'bg-accent/10 text-accent hover:bg-accent/20' },
  { value: 'low', label: 'Low', icon: BatteryLow, color: 'bg-primary/10 text-primary hover:bg-primary/20' },
];

const BLOCKER_OPTIONS: { value: CheckInBlocker; label: string }[] = [
  { value: 'lack_of_time', label: 'Lack of time' },
  { value: 'low_motivation', label: 'Low motivation' },
  { value: 'too_distracted', label: 'Too distracted' },
  { value: 'unclear_plan', label: 'Unclear plan' },
  { value: 'other', label: 'Other' },
];

export function CheckInModal({ open, onOpenChange, habit, onSubmit, isSubmitting }: CheckInModalProps) {
  const { form, updateField, reset, canSubmit, finalNote } = useCheckInForm();

  // Reset to step 1 every time the modal opens, regardless of how it was
  // closed previously (X button, backdrop, successful submit, parent-driven
  // close). Without this, the form retains stale state from the last session.
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handleSubmit = () => {
    if (!habit || !form.status) return;

    onSubmit({
      habitId: habit.id,
      status: form.status,
      mood: form.status === 'completed' ? (form.mood ?? undefined) : undefined,
      energy: form.status === 'completed' ? (form.energy ?? undefined) : undefined,
      blocker: form.status === 'missed' ? (form.blocker === 'other' ? 'other' : (form.blocker ?? undefined)) : undefined,
      note: finalNote || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="check-in-description">
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
          <DialogDescription id="check-in-description">
            Log your daily habit check-in, mood, and energy level.
          </DialogDescription>
        </DialogHeader>
        
        {habit && (
          <div className="mb-4">
            <Badge variant="outline" className="capitalize">
              {habit.name}
            </Badge>
          </div>
        )}

        {!form.status ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How did it go today?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex flex-col gap-2 border-2 hover:border-success hover:bg-success/5 transition-[border-color,background-color]"
                onClick={() => updateField('status', 'completed')}
              >
                <Check className="h-6 w-6 text-success" aria-hidden="true" />
                <span className="font-semibold"><span className="sr-only">I did it</span><span aria-hidden="true"> ✅</span></span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex flex-col gap-2 border-2 hover:border-destructive hover:bg-destructive/5 transition-[border-color,background-color]"
                onClick={() => updateField('status', 'missed')}
              >
                <X className="h-6 w-6 text-destructive" aria-hidden="true" />
                <span className="font-semibold"><span className="sr-only">I missed it</span><span aria-hidden="true"> ❌</span></span>
              </Button>
            </div>
          </div>
        ) : form.status === 'completed' ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">How are you feeling?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={form.mood === option.value ? "default" : "outline"}
                      size="sm"
                      className={cn(form.mood === option.value ? option.color : "")}
                      onClick={() => updateField('mood', option.value)}
                      aria-pressed={form.mood === option.value}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Energy level?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ENERGY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={form.energy === option.value ? "default" : "outline"}
                      size="sm"
                      className={cn(form.energy === option.value ? option.color : "")}
                      onClick={() => updateField('energy', option.value)}
                      aria-pressed={form.energy === option.value}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Note (optional)</p>
              <Textarea
                placeholder="Add any thoughts..."
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => updateField('status', null)} className="flex-1">
                Back
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">What stopped you?</p>
              <div className="space-y-2">
                {BLOCKER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={form.blocker === option.value ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => updateField('blocker', option.value)}
                    aria-pressed={form.blocker === option.value}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {form.blocker === 'other' && (
              <div>
                <p className="text-sm font-medium mb-2">Tell us more</p>
                <Textarea
                  placeholder="Describe what happened..."
                  value={form.otherBlocker}
                  onChange={(e) => updateField('otherBlocker', e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Note (optional)</p>
              <Textarea
                placeholder="Add any thoughts..."
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => updateField('status', null)} className="flex-1">
                Back
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
