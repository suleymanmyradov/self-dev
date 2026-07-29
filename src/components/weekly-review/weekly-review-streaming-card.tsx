import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RotateCcw } from "lucide-react";

/** Shows the AI summary text as it streams in, with a typing cursor. */
export function StreamingCoachCard({
  text,
  isFinalizing,
  thinkingMessage,
}: {
  text: string;
  isFinalizing?: boolean;
  thinkingMessage?: string;
}) {
  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          {isFinalizing ? 'Finalizing your review...' : text ? 'AI Coach is writing...' : 'AI Coach is thinking...'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {text ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {text}
            {!isFinalizing && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-accent/60 animate-pulse align-middle" />
            )}
          </p>
        ) : (
          <div className="flex items-center gap-2 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" />
            </div>
            {thinkingMessage && (
              <span className="text-sm text-muted-foreground animate-pulse">{thinkingMessage}</span>
            )}
          </div>
        )}
        {isFinalizing && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3 animate-spin" />
            Generating adjustments &amp; next-week plan...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
