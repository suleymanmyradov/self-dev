"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useTrackUpgradeEvent } from "@/hooks";

const FEEDBACK_REASONS = [
  "Too expensive",
  "Not enough value yet",
  "I need more time",
  "Missing a feature I need",
  "I do not trust AI coaching enough",
  "Other",
];

interface FakeDoorFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingInterval: "monthly" | "annual";
  onCheckout?: () => void;
  billingMode?: 'disabled' | 'fake_door' | 'stripe_test' | 'stripe_live';
}

export function FakeDoorFeedbackDialog({
  open,
  onOpenChange,
  billingInterval,
  onCheckout,
  billingMode = 'fake_door',
}: FakeDoorFeedbackDialogProps) {
  const [step, setStep] = useState<"interest" | "feedback">("interest");
  const [email, setEmail] = useState("");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const trackEvent = useTrackUpgradeEvent();

  const isStripeMode = billingMode === 'stripe_test' || billingMode === 'stripe_live';

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("interest");
      setEmail("");
      setSelectedReason(null);
      setFeedbackNote("");
      setSubmitted(false);
    }, 200);
  };

  const handleEarlyAccess = () => {
    if (isStripeMode && onCheckout) {
      trackEvent.mutate({
        eventType: "checkout_started",
        surface: "pricing_page",
        planCode: "pro",
        billingInterval,
      });
      onCheckout();
      return;
    }
    trackEvent.mutate({
      eventType: "checkout_started",
      surface: "pricing_page",
      planCode: "pro",
      billingInterval,
      metadataJson: JSON.stringify({ email, fakeDoor: true }),
    });
    setSubmitted(true);
  };

  const handleDismissWithFeedback = () => {
    if (selectedReason) {
      trackEvent.mutate({
        eventType: "prompt_dismissed",
        surface: "pricing_page",
        planCode: "pro",
        billingInterval,
        feedbackReason: selectedReason,
        feedbackNote: feedbackNote || undefined,
      });
    }
    handleClose();
  };

  const handleShowFeedback = () => {
    setStep("feedback");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === "interest" ? "Growth Pro Early Access" : "Help us improve"}
          </DialogTitle>
          <DialogDescription>
            {step === "interest"
              ? "We are testing Growth Pro access. Want early access?"
              : "Tell us what would make Pro more valuable for you."}
          </DialogDescription>
        </DialogHeader>

        {step === "interest" && !submitted && (
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary/50 border border-border p-4">
              <p className="text-sm">
                Growth Pro is currently in early access. Join the waitlist and
                we will reach out when it is ready for you.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleEarlyAccess}>
                {isStripeMode ? "Upgrade to Pro" : "Join early access waitlist"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowFeedback}
                className="text-muted-foreground"
              >
                Not right now &mdash; tell us why
              </Button>
            </div>
          </div>
        )}

        {step === "interest" && submitted && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
              <span className="text-success text-xl">✓</span>
            </div>
            <p className="text-sm font-medium">You are on the list!</p>
            <p className="text-sm text-muted-foreground">
              We will reach out when Growth Pro is ready for you.
            </p>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}

        {step === "feedback" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">What is holding you back?</p>
              <div className="grid gap-2">
                {FEEDBACK_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`text-left text-sm rounded-lg border px-3 py-2 transition-colors ${
                      selectedReason === reason
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
            {selectedReason === "Other" && (
              <Input
                placeholder="Tell us more..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleDismissWithFeedback}
                disabled={!selectedReason}
              >
                Submit feedback
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                Skip
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
