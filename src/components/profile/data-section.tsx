"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { deleteAccountAction } from "@/lib/actions/auth";
import { exportData } from "@/api/auth";
import { useConsent } from "@/hooks/use-consent";

export function DataSection() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [state, action, pending] = useActionState(deleteAccountAction, {
    success: false,
  });
  const { consent, setConsent } = useConsent();

  // On success the server action redirects to /login, so we only need to
  // handle the error path here. Close the dialog via render-time state
  // adjustment (per React docs) to avoid setState-in-effect cascading
  // renders; the toast is a side effect and stays in the effect.
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  if (!state.success && state.error && state.error !== lastError) {
    setLastError(state.error);
    setConfirmOpen(false);
  }
  useEffect(() => {
    if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { downloadUrl } = await exportData();
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
        toast.success("Your data export is ready. Download started in a new tab.");
      } else {
        toast.error("Export returned an empty URL. Please try again.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Data export failed");
    } finally {
      setExporting(false);
    }
  };

  // Consent withdrawal path per the analytics consent policy: flipping this
  // off stops any future product-analytics collection on this device.
  const handleAnalyticsToggle = (value: boolean) => {
    setConsent({ analytics: value });
    toast.success(value ? "Product analytics enabled" : "Product analytics disabled");
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-destructive">Delete account</p>
            <p className="text-xs text-muted-foreground">This action cannot be undone</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div>
          <p className="text-sm font-medium mb-1">Cookie settings</p>
          <p className="text-sm text-muted-foreground">
            Choose which optional cookies and storage we can use on this device. You can change
            this at any time — it also controls the consent banner.
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Necessary</p>
            <p className="text-xs text-muted-foreground">
              Sign-in and preferences — always on
            </p>
          </div>
          <Switch checked disabled aria-label="Necessary storage (always on)" />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Product analytics</p>
            <p className="text-xs text-muted-foreground">
              Anonymous usage data that helps improve Evolella — off until you opt in
            </p>
          </div>
          <Switch
            checked={consent?.analytics ?? false}
            onCheckedChange={handleAnalyticsToggle}
            aria-label="Product analytics"
          />
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This permanently removes your profile, habits, goals, check-ins,
              conversations, and saved items. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <form action={action}>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={pending}
              >
                {pending ? "Deleting…" : "Yes, delete my account"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
