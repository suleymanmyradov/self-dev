"use client";

import { CommunityCard } from "@/components/explore";
import type { ExploreSettings } from "@/api";

interface CommunityTabProps {
  settings: ExploreSettings;
}

export function CommunityTab({ settings }: CommunityTabProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h3 className="font-display text-lg font-normal text-foreground">People on the same goal</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Community features are coming soon. You&apos;ll be able to follow people working on similar habits and goals.
      </p>
      <div className="mt-4">
        <CommunityCard
          title={settings.community.title}
          description={settings.community.description}
          discordUrl={settings.community.discordUrl}
          xUrl={settings.community.xUrl}
        />
      </div>
    </div>
  );
}
