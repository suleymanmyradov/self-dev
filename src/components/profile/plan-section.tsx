"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Check } from "lucide-react";
import type { BillingOverviewResponse } from "@/api";
import { useBillingOverview, useCreateCustomerPortalSession, useTrackUpgradeEvent, useCreateCheckoutSession } from "@/hooks";
import { useBillingUIStore } from "@/store/billing-ui";
import { FakeDoorFeedbackDialog } from "@/components/billing/fake-door-feedback-dialog";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

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

export function PlanSection({ billingInitialData }: { billingInitialData?: BillingOverviewResponse }) {
  const { data: billing } = useBillingOverview(billingInitialData);
  const trackEvent = useTrackUpgradeEvent();
  const checkout = useCreateCheckoutSession();
  const portalMutation = useCreateCustomerPortalSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { fakeDoorOpen, openFakeDoor, closeFakeDoor, fakeDoorBillingInterval } = useBillingUIStore(
    useShallow((s) => ({
      fakeDoorOpen: s.fakeDoorOpen,
      openFakeDoor: s.openFakeDoor,
      closeFakeDoor: s.closeFakeDoor,
      fakeDoorBillingInterval: s.fakeDoorBillingInterval,
    }))
  );

  const [interval, setIntervalChoice] = useState<"monthly" | "annual">("annual");

  const currentPlanCode = billing?.subscription?.planCode ?? "free";
  const isPro = currentPlanCode === "pro";
  const billingMode = billing?.billingMode ?? "fake_door";
  const isStripeMode = billingMode === "stripe_test" || billingMode === "stripe_live";

  const proPlan = billing ? billing.plans.find((p) => p.code === "pro") : null;
  const annualPriceCents = proPlan?.priceAnnualCents ?? 9990;
  const monthlyPriceCents = proPlan?.priceMonthlyCents ?? 999;
  const annualMonthlyDollars = annualPriceCents / 100 / 12;
  const monthlyDollars = monthlyPriceCents / 100;
  const displayPrice = interval === "annual" ? annualMonthlyDollars : monthlyDollars;

  // Show a toast when returning from Stripe checkout via SuccessURL/CancelURL.
  // On success, kick off a brief polling loop so the billing query refetches
  // after the Stripe webhook lands — the webhook that actually flips the
  // subscription to "active" can arrive a few seconds after the redirect, so
  // a single refetch may still read stale "free" state.
  const [isPollingBilling, setIsPollingBilling] = useState(false);
  useEffect(() => {
    const checkoutResult = searchParams.get("checkout");
    if (checkoutResult !== "success" && checkoutResult !== "canceled") return;
    if (checkoutResult === "success") {
      toast.success("Payment successful! Your Pro plan is now active.");
      setIsPollingBilling(true);
    } else {
      toast.info("Checkout was canceled. You can try again anytime.");
    }
    // Clean up the param so the toast doesn't reappear on refresh.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("checkout");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  // Poll the billing overview for ~12s after a successful checkout to catch
  // the webhook-driven subscription update. Decoupled from the URL-param
  // effect above so the router.replace (which clears the param) doesn't
  // cancel the timers.
  useEffect(() => {
    if (!isPollingBilling) return;
    const refetch = () => queryClient.invalidateQueries({ queryKey: ["billing"] });
    refetch();
    const timers = [2, 4, 7, 11].map((s) => setTimeout(refetch, s * 1000));
    const stop = setTimeout(() => setIsPollingBilling(false), 12_000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(stop);
    };
  }, [isPollingBilling, queryClient]);

  const handleUpgrade = () => {
    trackEvent.mutate({
      eventType: "prompt_clicked",
      surface: "settings_billing",
      trigger: undefined,
      planCode: "pro",
      billingInterval: interval,
    });

    if (isStripeMode) {
      handleCheckout();
    } else {
      openFakeDoor(interval);
    }
  };

  const handleCheckout = () => {
    checkout.mutate(
      { planCode: "pro", billingInterval: interval },
      {
        onSuccess: (data) => {
          const url = data.checkoutUrl;
          if (url) {
            try {
              const parsed = new URL(url);
              const allowedHosts = ["checkout.stripe.com", "pay.stripe.com", "checkout.link.co"];
              if (allowedHosts.includes(parsed.hostname)) {
                toast.success("Redirecting to secure Stripe checkout...");
                window.location.href = parsed.toString();
              } else {
                toast.error("Unexpected checkout URL. Please contact support.");
              }
            } catch {
              toast.error("Received an invalid checkout URL. Please try again.");
            }
          } else {
            toast.error("Checkout session could not be created. Please try again.");
          }
        },
        onError: () => {
          toast.error("Could not start checkout. Please try again in a moment.");
        },
      }
    );
  };

  const handleManageBilling = () => {
    portalMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.portalUrl) {
          window.location.href = data.portalUrl;
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Plan & billing</h1>

      {/* Billing interval toggle */}
      {!isPro && (
        <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
          {(["monthly", "annual"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setIntervalChoice(opt)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-[color,background-color]",
                interval === opt
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt === "annual" ? "Annual (2 months free)" : "Monthly"}
            </button>
          ))}
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free card */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">Free</h3>
            {currentPlanCode === "free" && (
              <span className="text-[10px] font-mono tracking-wider text-muted-foreground border border-border rounded px-2 py-0.5">
                CURRENT
              </span>
            )}
          </div>

          <div>
            <span className="font-mono text-3xl tabular-nums">$0</span>
            <span className="text-sm text-muted-foreground ml-1">/month</span>
          </div>

          <ul className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            className="w-full"
            disabled={currentPlanCode === "free"}
          >
            {currentPlanCode === "free" ? "You&apos;re on this plan" : "Start Free"}
          </Button>
        </div>

        {/* Pro card */}
        <div className="rounded-xl bg-foreground text-background p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">Pro</h3>
            <span className="text-[10px] font-mono tracking-wider bg-success text-success-foreground rounded px-2 py-0.5">
              2 MONTHS FREE YEARLY
            </span>
          </div>

          <div>
            <span className="font-mono text-3xl tabular-nums">
              ${displayPrice.toFixed(0)}
            </span>
            <span className="text-sm text-background/60 ml-1">
              {interval === "annual" ? "per month, billed yearly" : "per month"}
            </span>
          </div>

          <ul className="space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <>
              <Button
                variant="secondary"
                className="w-full"
                disabled
              >
                You&apos;re on this plan
              </Button>
              <Button
                variant="outline"
                className="w-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
                onClick={handleManageBilling}
                disabled={portalMutation.isPending}
              >
                {portalMutation.isPending ? "Loading..." : "Manage billing"}
              </Button>
            </>
          ) : (
            <Button
              className="w-full bg-background text-foreground hover:bg-background/90"
              disabled={checkout.isPending}
              onClick={handleUpgrade}
            >
              {checkout.isPending ? "Opening checkout..." : "Upgrade to Pro"}
            </Button>
          )}

          <p className="text-xs text-background/50">
            Cancel any time. Your data stays yours.
          </p>
        </div>
      </div>

      {/* Fake door dialog */}
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
