import { memo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles } from "lucide-react";
import type { PlanAdjustmentSuggestion } from "@/api";

interface PlanAdjustmentCardProps {
  suggestion: PlanAdjustmentSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export const PlanAdjustmentCard = memo(function PlanAdjustmentCard({ suggestion, onAccept, onDismiss, loading }: PlanAdjustmentCardProps) {
  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case "reduce_difficulty":
        return "bg-calm/10 text-calm border-calm/20";
      case "increase_difficulty":
        return "bg-growth/10 text-growth border-growth/20";
      case "change_time":
        return "bg-primary/10 text-primary border-primary/20";
      case "clarify_plan":
        return "bg-energy/10 text-energy border-energy/20";
      case "pause":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "keep_same":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getAdjustmentTypeLabel = (type: string) => {
    switch (type) {
      case "reduce_difficulty":
        return "Reduce Difficulty";
      case "increase_difficulty":
        return "Increase Difficulty";
      case "change_time":
        return "Change Time";
      case "clarify_plan":
        return "Clarify Plan";
      case "pause":
        return "Pause";
      case "keep_same":
        return "Keep Same";
      default:
        return type;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "check_in":
        return "Check-in";
      case "weekly_review":
        return "Weekly Review";
      case "assistant":
        return "AI Assistant";
      case "pattern_analysis":
        return "Pattern Analysis";
      default:
        return source;
    }
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-background/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Plan Adjustment
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getAdjustmentTypeColor(suggestion.adjustmentType)}>
                  {getAdjustmentTypeLabel(suggestion.adjustmentType)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getSourceLabel(suggestion.source)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Why this matters</p>
          <p className="text-sm">{suggestion.reason}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Suggestion</p>
          <p className="text-sm font-medium">{suggestion.suggestion}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onDismiss}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Dismiss
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={onAccept}
          disabled={loading}
        >
          <Check className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </CardFooter>
    </Card>
  );
});