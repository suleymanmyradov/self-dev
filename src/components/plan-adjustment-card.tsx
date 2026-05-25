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

export function PlanAdjustmentCard({ suggestion, onAccept, onDismiss, loading }: PlanAdjustmentCardProps) {
  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case "reduce_difficulty":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "increase_difficulty":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "change_time":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      case "clarify_plan":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "pause":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "keep_same":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
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
}