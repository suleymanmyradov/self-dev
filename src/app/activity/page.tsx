"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ActivityItem = { id: string; title: string; detail: string; when: string };

const mockActivity: ActivityItem[] = [
  { id: "a1", title: "Created a habit", detail: "Morning Walk", when: "2h ago" },
  { id: "a2", title: "Completed a habit", detail: "Meditate", when: "6h ago" },
  { id: "a3", title: "Added a goal", detail: "Ship a side project", when: "1d ago" },
];

export default function ActivityPage() {
  const [items] = useState<ActivityItem[]>(mockActivity);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Your activity</h1>
            <p className="text-sm text-muted-foreground">A timeline of your recent actions.</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {items.map((it) => (
                  <li key={it.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{it.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{it.detail}</p>
                      </div>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">{it.when}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">More detailed analytics coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
