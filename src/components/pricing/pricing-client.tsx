"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillingOverview, useTrackUpgradeEvent, useCreateCheckoutSession } from "@/hooks";
import { useBillingUIStore } from "@/store/billing-ui";
import { PlanBadge } from "@/components/billing/plan-badge";
import { FakeDoorFeedbackDialog } from "@/components/billing/fake-door-feedback-dialog";
import { toast } from "@/components/ui/sonner";
import type { BillingOverviewResponse, Plan } from "@/api";
import { useSearchParamEnum } from "@/lib/url-state";
import { useShallow } from "zustand/react/shallow";
import { Switch } from "@/components/ui/switch";

const FREE_FEATURES = [
  "3 active goals",
  "5 active habits",
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

export function PricingClient({ billingInitialData }: { billingInitialData?: BillingOverviewResponse }) {
  const [billingInterval, setBillingInterval] = useSearchParamEnum<"monthly" | "annual">(
    "interval",
    ["monthly", "annual"] as const,
    "annual"
  );
  const { fakeDoorOpen, openFakeDoor, closeFakeDoor, fakeDoorBillingInterval } = useBillingUIStore(
    useShallow((s) => ({
      fakeDoorOpen: s.fakeDoorOpen,
      openFakeDoor: s.openFakeDoor,
      closeFakeDoor: s.closeFakeDoor,
      fakeDoorBillingInterval: s.fakeDoorBillingInterval,
    }))
  );

  const { data: billing } = useBillingOverview(billingInitialData);
  const trackEvent = useTrackUpgradeEvent();
  const checkout = useCreateCheckoutSession();

  // Show a toast when returning from Stripe checkout via SuccessURL/CancelURL.
  // Backend sets these URLs to /pricing?checkout=success and ?checkout=canceled.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const checkoutResult = searchParams.get("checkout");
    if (checkoutResult === "success") {
      toast.success("Payment successful! Your Pro plan is now active.");
    } else if (checkoutResult === "canceled") {
      toast.info("Checkout was canceled. You can try again anytime.");
    } else {
      return;
    }
    // Clean up the param so the toast doesn't reappear on refresh.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("checkout");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

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
      openFakeDoor(billingInterval);
    }
  };

  const handleCheckout = () => {
    checkout.mutate(
      { planCode: "pro", billingInterval },
      {
        onSuccess: (data) => {
          const url = data.checkoutUrl;
          if (url) {
            try {
              const parsed = new URL(url);
              const allowedHosts = [
                "checkout.stripe.com",
                "pay.stripe.com",
                "checkout.link.co",
              ];
              if (allowedHosts.includes(parsed.hostname)) {
                toast.success("Redirecting to secure Stripe checkout...");
                window.location.href = parsed.toString();
              } else {
                console.error("[Pricing] Blocked unexpected redirect:", parsed.hostname);
                toast.error("Unexpected checkout URL. Please contact support.");
              }
            } catch {
              console.error("[Pricing] Invalid checkout URL");
              toast.error("Received an invalid checkout URL. Please try again.");
            }
          } else {
            toast.error("Checkout session could not be created. Please try again.");
          }
        },
        onError: (err) => {
          console.error("[Pricing] Checkout session creation failed:", err);
          toast.error("Could not start checkout. Please try again in a moment.");
        },
      }
    );
  };

  const proPlan = billing ? billing.plans.find((p) => p.code === "pro") : null;
  // Prices come from the API in cents (DB seed: 999 monthly, 9990 annual).
  const monthlyPriceCents = proPlan?.priceMonthlyCents ?? 999;
  const annualPriceCents = proPlan?.priceAnnualCents ?? 9990;
  // Convert to dollars for display.
  const annualMonthlyDollars = annualPriceCents / 100 / 12;
  const savingsPercent = Math.round(
    (1 - annualPriceCents / (monthlyPriceCents * 12)) * 100
  );

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
            <Switch
              checked={billingInterval === "annual"}
              onCheckedChange={(checked) => setBillingInterval(checked ? "annual" : "monthly")}
              aria-label="Toggle annual billing"
            />
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

          {/* Plan cards — render immediately; Pro price uses fallback defaults
              until billing data arrives (server-prefetched for authed users). */}
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
                          {formatPrice(monthlyPriceCents)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /month
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold">
                          ${annualMonthlyDollars.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /month, billed annually
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPrice(annualPriceCents)}/year
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
                      disabled={checkout.isPending}
                      onClick={() => {
                        const proPlan = billing?.plans?.find(
                          (p) => p.code === "pro"
                        );
                        if (proPlan) handleUpgrade(proPlan);
                        else toast.error("Pro plan is not available right now. Please refresh the page.");
                      }}
                    >
                      {checkout.isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Opening checkout...
                        </>
                      ) : (
                        "Upgrade to Pro"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
          </div>

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
          onOpenChange={closeFakeDoor}
          billingInterval={fakeDoorBillingInterval}
          onCheckout={handleCheckout}
          billingMode={billingMode}
        />
      )}
    </div>
  );
}
