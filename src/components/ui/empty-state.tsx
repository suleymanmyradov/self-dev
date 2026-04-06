import { cn } from "@/lib/utils";
import { LucideIcon, Inbox, Target, FileText, Search } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "habits" | "goals" | "articles" | "search";
  className?: string;
}

const variantConfig = {
  default: {
    icon: Inbox,
    iconColor: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  habits: {
    icon: Target,
    iconColor: "text-growth",
    bgColor: "bg-growth-soft/30",
  },
  goals: {
    icon: Target,
    iconColor: "text-energy",
    bgColor: "bg-energy-soft/30",
  },
  articles: {
    icon: FileText,
    iconColor: "text-calm",
    bgColor: "bg-calm-soft/30",
  },
  search: {
    icon: Search,
    iconColor: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl p-4 mb-4",
          config.bgColor
        )}
      >
        <Icon className={cn("h-8 w-8", config.iconColor)} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
