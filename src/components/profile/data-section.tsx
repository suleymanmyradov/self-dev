"use client";

import { Button } from "@/components/ui/button";

export function DataSection() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Data & privacy</h1>

      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div>
          <p className="text-sm font-medium mb-1">Your data belongs to you</p>
          <p className="text-sm text-muted-foreground">
            Export everything you&apos;ve created, or delete your account and all associated data.
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Export everything</p>
            <p className="text-xs text-muted-foreground">Download all your data as JSON</p>
          </div>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-destructive">Delete account</p>
            <p className="text-xs text-muted-foreground">This action cannot be undone</p>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
