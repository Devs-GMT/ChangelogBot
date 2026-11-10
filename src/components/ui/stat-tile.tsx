import { cn } from "@/lib/utils/cn";

export function StatTile({
  label,
  value,
  className,
  valueProps,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  valueProps?: React.HTMLAttributes<HTMLSpanElement>;
}) {
  return (
    <div className={cn("rounded-xl border border-line bg-paper px-4 py-3", className)}>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
        <span {...valueProps}>{value}</span>
      </div>
    </div>
  );
}
