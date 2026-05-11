"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Smile, Meh, Frown, AlertTriangle, Zap, Battery, BatteryLow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit, CheckInStatus, CheckInMood, CheckInEnergy, CheckInBlocker } from "@/api";

export type CheckInModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
  onSubmit: (data: { habitId: string; status: CheckInStatus; mood?: CheckInMood; energy?: CheckInEnergy; blocker?: CheckInBlocker; note?: string }) => void;
  isSubmitting?: boolean;
};

const MOOD_OPTIONS: { value: CheckInMood; label: string; icon: any; color: string }[] = [
  { value: 'great', label: 'Great', icon: Smile, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'low', label: 'Low', icon: Frown, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { value: 'stressed', label: 'Stressed', icon: AlertTriangle, color: 'bg-red-100 text-red-700 hover:bg-red-200' },
];

const ENERGY_OPTIONS: { value: CheckInEnergy; label: string; icon: any; color: string }[] = [
  { value: 'high', label: 'High', icon: Zap, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'medium', label: 'Medium', icon: Battery, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'low', label: 'Low', icon: BatteryLow, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
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
    
    const finalBlocker: CheckInBlocker | undefined = blocker === 'other' && otherBlocker.trim() 
      ? (otherBlocker.trim() as CheckInBlocker) 
      : (blocker ?? undefined);
    
    onSubmit({
      habitId: habit.id,
      status,
      mood: status === 'completed' ? (mood ?? undefined) : undefined,
      energy: status === 'completed' ? (energy ?? undefined) : undefined,
      blocker: status === 'missed' ? finalBlocker : undefined,
      note: note.trim() || undefined,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
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
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50 transition-all"
                onClick={() => setStatus('completed')}
              >
                <Check className="h-6 w-6 text-green-600" />
                <span className="font-semibold">I did it ✅</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex flex-col gap-2 border-2 hover:border-red-500 hover:bg-red-50 transition-all"
                onClick={() => setStatus('missed')}
              >
                <X className="h-6 w-6 text-red-600" />
                <span className="font-semibold">I missed it ❌</span>
              </Button>
            </div>
          </div>
        ) : status === 'completed' ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">How are you feeling?</p>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={mood === option.value ? "default" : "outline"}
                      size="sm"
                      className={cn(mood === option.value ? option.color : "")}
                      onClick={() => setMood(option.value)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Energy level?</p>
              <div className="grid grid-cols-3 gap-2">
                {ENERGY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={energy === option.value ? "default" : "outline"}
                      size="sm"
                      className={cn(energy === option.value ? option.color : "")}
                      onClick={() => setEnergy(option.value)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
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
                disabled={!mood || !energy || isSubmitting}
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
