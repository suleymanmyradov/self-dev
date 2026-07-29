import { Button } from "@/components/ui/button";
import type { WeeklyReview } from "@/api";

/** Dark "Coach's read on the week" sidebar card with AI summary + adjustments. */
export function CoachCard({
  review,
  isStreaming,
  streamingText,
}: {
  review: WeeklyReview;
  isStreaming: boolean;
  streamingText: string;
}) {
  return (
    <div className="rounded-xl bg-foreground p-5 text-background">
      <p className="font-mono text-xs uppercase tracking-wider text-background/60">
        Coach&apos;s read on the week
      </p>
      {isStreaming ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {streamingText || '...'}
          </p>
        </div>
      ) : review.aiSummary ? (
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{review.aiSummary}</p>
      ) : (
        <p className="mt-3 text-sm text-background/60">No coach analysis available yet.</p>
      )}
      {review.suggestedAdjustments?.length > 0 && (
        <p className="mt-3 text-sm text-background/80">
          {review.suggestedAdjustments[0].suggestion}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" variant="outline" className="border-background/20 text-background hover:bg-background/10">
          Apply to next week
        </Button>
        <Button size="sm" variant="ghost" className="text-background/80 hover:bg-background/10 hover:text-background">
          Discuss
        </Button>
      </div>
    </div>
  );
}
