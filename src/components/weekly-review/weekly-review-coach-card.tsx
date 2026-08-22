import type { WeeklyReview } from "@/api";

/** Dark "Coach's read on the week" card with the AI summary. */
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
    </div>
  );
}
