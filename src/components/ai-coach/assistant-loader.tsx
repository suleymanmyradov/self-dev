"use client";

import dynamic from "next/dynamic";

const Assistant = dynamic(
  () => import("@/components/ai-coach/assistant").then((mod) => mod.Assistant),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading coach...
      </div>
    ),
  }
);

export function AssistantLoader() {
  return <Assistant />;
}
