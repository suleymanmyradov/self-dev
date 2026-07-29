"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ArticleShareButtonProps {
  articleId: string;
  title: string;
}

export default function ArticleShareButton({ articleId, title }: ArticleShareButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/article/${articleId}`
        : `/article/${articleId}`;
    const shareData = { title, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — no toast.
      }
      return;
    }

    // Fallback: copy to clipboard.
    try {
      setBusy(true);
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-[color] hover:text-foreground disabled:opacity-60"
      aria-label="Share article"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
