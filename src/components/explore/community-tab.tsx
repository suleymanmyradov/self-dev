"use client";

import { CommunityCard } from "@/components/explore";
import type { ExploreSettings } from "@/api";

interface CommunityTabProps {
  settings: ExploreSettings;
}

export function CommunityTab({ settings }: CommunityTabProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <div className="text-center">
        <h2 className="font-display text-2xl font-normal text-foreground">Grow with others</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Join the wider Growth community to share progress, exchange ideas, and stay connected.
        </p>
      </div>
      <CommunityCard
        title={settings.community.title}
        description={settings.community.description}
        discordUrl={settings.community.discordUrl}
        xUrl={settings.community.xUrl}
      />
    </div>
  );
}
