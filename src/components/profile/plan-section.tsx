"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { BillingOverviewResponse } from "@/api";
import { useBillingOverview, useCreateCustomerPortalSession, useTrackUpgradeEvent } from "@/hooks";
import { useBillingUIStore } from "@/store/billing-ui";
import { FakeDoorFeedbackDialog } from "@/components/billing/fake-door-feedback-dialog";
import { useShallow } from "zustand/react/shallow";

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function PlanSection({ billingInitialData }: { billingInitialData?: BillingOverviewResponse }) {
  const { data: billing } = useBillingOverview(billingInitialData);
  const trackEvent = useTrackUpgradeEvent();
  const portalMutation = useCreateCustomerPortalSession();
  const router = useRouter();

  const { fakeDoorOpen, openFakeDoor, closeFakeDoor, fakeDoorBillingInterval } = useBillingUIStore(
    useShallow((s) => ({
      fakeDoorOpen: s.fakeDoorOpen,
      openFakeDoor: s.openFakeDoor,
      closeFakeDoor: s.closeFakeDoor,
      fakeDoorBillingInterval: s.fakeDoorBillingInterval,
    }))
  );

  const sub = billing?.subscription;
  const currentPlanCode = sub?.planCode ?? "free";
  const isPro = currentPlanCode === "pro";
  const billingMode = billing?.billingMode ?? "fake_door";
  const isPaddleMode = billingMode === "paddle";

  const periodEnd = formatDate(sub?.currentPeriodEnd);
  const intervalLabel =
    sub?.billingInterval === "annual" ? "Annual" : sub?.billingInterval === "monthly" ? "Monthly" : null;

  const handleUpgrade = () => {
    trackEvent.mutate({
      eventType: "prompt_clicked",
      surface: "settings_billing",
      trigger: undefined,
      planCode: "pro",
    });

    if (isPaddleMode) {
      // Plan comparison + Paddle checkout live on /pricing.
      router.push("/pricing");
    } else {
      openFakeDoor();
    }
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
      <h1 className="font-display text-2xl">Plan &amp; billing</h1>

      {/* Current plan status — the plan picker itself lives on /pricing. */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{isPro ? "Pro" : "Free"}</h3>
          {sub?.status && (
            <span className="text-[10px] font-mono tracking-wider text-muted-foreground border border-border rounded px-2 py-0.5 uppercase">
              {sub.status}
            </span>
          )}
        </div>

        {isPro && (
          <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            {intervalLabel && (
              <div className="flex justify-between">
                <dt>Billing</dt>
                <dd className="text-foreground">{intervalLabel}</dd>
              </div>
            )}
            {periodEnd && (
              <div className="flex justify-between">
                <dt>{sub?.cancelAtPeriodEnd ? "Access until" : "Renews"}</dt>
                <dd className="text-foreground">{periodEnd}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-5 space-y-2">
          {isPro ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageBilling}
              disabled={portalMutation.isPending}
            >
              {portalMutation.isPending ? "Loading..." : "Manage billing"}
            </Button>
          ) : (
            <>
              <Button className="w-full" onClick={handleUpgrade}>
                Upgrade to Pro
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/pricing")}
              >
                Compare plans
              </Button>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Cancel any time. Your data stays yours.
        </p>
      </div>

      {/* Fake door dialog (only when billing is in fake_door mode) */}
      {billing?.plans && (
        <FakeDoorFeedbackDialog
          open={fakeDoorOpen}
          onOpenChange={closeFakeDoor}
          billingInterval={fakeDoorBillingInterval}
          onCheckout={() => router.push("/pricing")}
          billingMode={billingMode}
        />
      )}
    </div>
  );
}
