"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillingOverview, useTrackUpgradeEvent, useCreateCheckoutSession } from "@/hooks";
import { PlanBadge } from "@/components/billing/plan-badge";
import { FakeDoorFeedbackDialog } from "@/components/billing/fake-door-feedback-dialog";
import type { Plan } from "@/api";

const FREE_FEATURES = [
  "1 active goal",
  "3 active habits",
  "Daily check-ins",
  "Basic AI feedback",
  "Current weekly review",
];

const PRO_FEATURES = [
  "Unlimited goals",
  "Unlimited habits",
  "Full weekly review history",
  "Personalized AI coaching",
  "Advanced plan adjustments",
  "Accountability style controls",
  "Priority reminders",
];

function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export default function PricingPage() {
  const searchParams = useSearchParams();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">(
    (searchParams.get("interval") as "monthly" | "annual") ?? "annual"
  );
  const [fakeDoorOpen, setFakeDoorOpen] = useState(false);

  const { data: billing, isLoading } = useBillingOverview();
  const trackEvent = useTrackUpgradeEvent();
  const checkout = useCreateCheckoutSession();

  const currentPlanCode = billing?.subscription?.planCode ?? "free";
  const isPro = currentPlanCode === "pro";
  const billingMode = billing?.billingMode ?? "fake_door";
  const isStripeMode = billingMode === "stripe_test" || billingMode === "stripe_live";

  const handleUpgrade = (plan: Plan) => {
    trackEvent.mutate({
      eventType: "prompt_clicked",
      surface: "pricing_page",
      trigger: undefined,
      planCode: plan.code,
      billingInterval,
    });

    if (isStripeMode) {
      handleCheckout();
    } else {
      setFakeDoorOpen(true);
    }
  };

  const handleCheckout = () => {
    checkout.mutate(
      { planCode: "pro", billingInterval },
      {
        onSuccess: (data) => {
          if (data.data?.checkoutUrl) {
            window.location.href = data.data.checkoutUrl;
          }
        },
      }
    );
  };

  const annualSavings = billing
    ? billing.plans.find((p) => p.code === "pro")
    : null;
  const monthlyPrice = annualSavings?.priceMonthlyCents ?? 900;
  const annualPrice = annualSavings?.priceAnnualCents ?? 7200;
  const annualMonthly = annualPrice / 12;
  const savingsPercent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-energy" />
              <PlanBadge />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Stay accountable with a coach that remembers your goals.
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start with daily check-ins for free. Upgrade when you want deeper
              personalization, weekly history, and unlimited plans.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              className={cn(
                "text-sm font-medium transition-colors",
                billingInterval === "monthly"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBillingInterval("monthly")}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={cn(
                "relative rounded-full p-1 transition-colors",
                billingInterval === "annual" ? "bg-primary/15" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full transition-transform",
                  billingInterval === "annual"
                    ? "translate-x-5 bg-primary"
                    : "translate-x-0 bg-muted-foreground/40"
                )}
              />
            </button>
            <button
              className={cn(
                "text-sm font-medium transition-colors",
                billingInterval === "annual"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBillingInterval("annual")}
            >
              Annual
            </button>
            {billingInterval === "annual" && savingsPercent > 0 && (
              <Badge className="ml-2 bg-growth/15 text-growth border-growth/30">
                Save {savingsPercent}%
              </Badge>
            )}
          </div>

          {/* Plan cards */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-24" />
                  <CardContent className="h-48" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Free Plan */}
              <Card
                className={cn(
                  "relative overflow-hidden",
                  currentPlanCode === "free" && "ring-2 ring-border"
                )}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Free</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Start with the core accountability loop.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <ul className="space-y-3">
                    {FREE_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-growth shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={currentPlanCode === "free"}
                  >
                    {currentPlanCode === "free" ? "Current plan" : "Start Free"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card
                className={cn(
                  "relative overflow-hidden border-energy/30",
                  isPro && "ring-2 ring-energy/50"
                )}
              >
                <div className="absolute top-0 right-0 bg-energy px-3 py-1 text-xs font-semibold text-energy-foreground rounded-bl-lg">
                  Pro
                </div>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-4 w-4 text-energy" />
                    Growth Pro
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Unlock deeper personalization, history, and unlimited
                    accountability plans.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    {billingInterval === "monthly" ? (
                      <div>
                        <span className="text-4xl font-bold">
                          {formatPrice(monthlyPrice)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /month
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold">
                          ${annualMonthly.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /month, billed annually
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPrice(annualPrice)}/year
                        </p>
                      </div>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {PRO_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-energy shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isPro ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      variant="energy"
                      className="w-full"
                      onClick={() => {
                        const proPlan = billing?.plans?.find(
                          (p) => p.code === "pro"
                        );
                        if (proPlan) handleUpgrade(proPlan);
                      }}
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Trust and safety */}
          <div className="mt-10 text-center text-sm text-muted-foreground space-y-2">
            <p>Cancel anytime. No hidden fees.</p>
            <p>
              Growth Pro is an AI accountability coach, not therapy or clinical
              support.
            </p>
          </div>
        </div>
      </div>

      {/* Fake Door / Stripe Checkout Dialog */}
      {billing?.plans && (
        <FakeDoorFeedbackDialog
          open={fakeDoorOpen}
          onOpenChange={setFakeDoorOpen}
          billingInterval={billingInterval}
          onCheckout={handleCheckout}
          billingMode={billingMode}
        />
      )}
    </div>
  );
}
