"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Smile, Meh, Frown, AlertTriangle, Zap, Battery, BatteryLow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit, CheckInStatus, CheckInMood, CheckInEnergy, CheckInBlocker } from "@/api";

export type CheckInSubmitData = {
  habitId: string;
  status: CheckInStatus;
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
  { value: 'great', label: 'Great', icon: Smile, color: 'bg-growth/10 text-growth hover:bg-growth/20' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'bg-calm/10 text-calm hover:bg-calm/20' },
  { value: 'low', label: 'Low', icon: Frown, color: 'bg-energy/10 text-energy hover:bg-energy/20' },
  { value: 'stressed', label: 'Stressed', icon: AlertTriangle, color: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
];

const ENERGY_OPTIONS: { value: CheckInEnergy; label: string; icon: LucideIcon; color: string }[] = [
  { value: 'high', label: 'High', icon: Zap, color: 'bg-growth/10 text-growth hover:bg-growth/20' },
  { value: 'medium', label: 'Medium', icon: Battery, color: 'bg-calm/10 text-calm hover:bg-calm/20' },
  { value: 'low', label: 'Low', icon: BatteryLow, color: 'bg-energy/10 text-energy hover:bg-energy/20' },
];

const BLOCKER_OPTIONS: { value: CheckInBlocker; label: string }[] = [
  { value: 'lack_of_time', label: 'Lack of time' },
  { value: 'low_motivation', label: 'Low motivation' },
  { value: 'too_distracted', label: 'Too distracted' },
  { value: 'unclear_plan', label: 'Unclear plan' },
  { value: 'other', label: 'Other' },
];

export function CheckInModal({ open, onOpenChange, habit, onSubmit, isSubmitting }: CheckInModalProps) {
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [mood, setMood] = useState<CheckInMood | null>(null);
  const [energy, setEnergy] = useState<CheckInEnergy | null>(null);
  const [blocker, setBlocker] = useState<CheckInBlocker | null>(null);
  const [otherBlocker, setOtherBlocker] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!habit || !status) return;

    // When blocker is "other", send the custom text in the note field instead of as the blocker value
    // This maintains type safety and keeps blocker values constrained to the enum
    const finalNote = blocker === 'other' && otherBlocker.trim()
      ? `Blocker: ${otherBlocker.trim()}${note.trim() ? `\n\n${note.trim()}` : ''}`
      : note.trim();

    onSubmit({
      habitId: habit.id,
      status,
      mood: status === 'completed' ? (mood ?? undefined) : undefined,
      energy: status === 'completed' ? (energy ?? undefined) : undefined,
      blocker: status === 'missed' ? (blocker === 'other' ? 'other' : (blocker ?? undefined)) : undefined,
      note: finalNote || undefined,
    });
  };

  const canSubmit = status && (
    status === 'completed' ? mood && energy : blocker && (blocker !== 'other' || otherBlocker.trim())
  );

  const resetForm = () => {
    setStatus(null);
    setMood(null);
    setEnergy(null);
    setBlocker(null);
    setOtherBlocker('');
    setNote('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
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

        {!status ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How did it go today?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex flex-col gap-2 border-2 hover:border-growth hover:bg-growth/5 transition-all"
                onClick={() => setStatus('completed')}
              >
                <Check className="h-6 w-6 text-growth" aria-hidden="true" />
                <span className="font-semibold"><span className="sr-only">I did it</span><span aria-hidden="true"> ✅</span></span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex flex-col gap-2 border-2 hover:border-destructive hover:bg-destructive/5 transition-all"
                onClick={() => setStatus('missed')}
              >
                <X className="h-6 w-6 text-destructive" aria-hidden="true" />
                <span className="font-semibold"><span className="sr-only">I missed it</span><span aria-hidden="true"> ❌</span></span>
              </Button>
            </div>
          </div>
        ) : status === 'completed' ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">How are you feeling?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={mood === option.value ? "default" : "outline"}
                      size="sm"
                      className={cn(mood === option.value ? option.color : "")}
                      onClick={() => setMood(option.value)}
                      aria-pressed={mood === option.value}
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
                      variant={energy === option.value ? "default" : "outline"}
                      size="sm"
                      className={cn(energy === option.value ? option.color : "")}
                      onClick={() => setEnergy(option.value)}
                      aria-pressed={energy === option.value}
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
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStatus(null)} className="flex-1">
                Back
              </Button>
              <Button
                variant="growth"
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
              <p className="text-sm font-medium mb-2">What held you back?</p>
              <div className="grid grid-cols-1 gap-2">
                {BLOCKER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={blocker === option.value ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => setBlocker(option.value as CheckInBlocker)}
                    aria-pressed={blocker === option.value}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {blocker === 'other' && (
              <div>
                <p className="text-sm font-medium mb-2">Please specify</p>
                <Textarea
                  placeholder="What was the blocker?"
                  value={otherBlocker}
                  onChange={(e) => setOtherBlocker(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Note (optional)</p>
              <Textarea
                placeholder="Add any thoughts..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStatus(null)} className="flex-1">
                Back
              </Button>
              <Button 
                variant="growth" 
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
