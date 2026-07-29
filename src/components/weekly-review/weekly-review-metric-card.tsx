import { cn } from "@/lib/utils";

/** Compact metric card with mono label + large mono number + context line. */
export function MetricCard({
  label,
  value,
  context,
  contextClass,
}: {
  label: string;
  value: string;
  context: string;
  contextClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums font-semibold">{value}</p>
      <p className={cn("mt-1 text-xs text-muted-foreground", contextClass)}>{context}</p>
    </div>
  );
}
