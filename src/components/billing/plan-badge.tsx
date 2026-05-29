"use client";

import { Badge } from "@/components/ui/badge";
import { useBillingOverview } from "@/hooks";
import { Crown } from "lucide-react";

export function PlanBadge() {
  const { data: billing } = useBillingOverview();
  const planCode = billing?.subscription?.planCode ?? "free";

  if (planCode === "pro") {
    return (
      <Badge className="bg-energy/15 text-energy border-energy/30 gap-1">
        <Crown className="h-3 w-3" />
        Pro
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      Free
    </Badge>
  );
}
