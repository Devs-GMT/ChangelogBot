import { GROUPS, type Group } from "@/lib/changelog/types";
import { cn } from "@/lib/utils/cn";

const dots: Record<Group, string> = {
  new: "bg-new",
  improved: "bg-improved",
  fixed: "bg-fixed",
  breaking: "bg-breaking",
};

/** "New / Improved / Fixed / Breaking" label: a coloured dot plus text, no pill (emoji stay in plain-text outputs only). */
export function GroupBadge({ group, className, label }: { group: Group; className?: string; label?: string }) {
  const meta = GROUPS.find((g) => g.id === group)!;
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap text-ink", className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", dots[group])} aria-hidden="true" />
      {label ?? meta.label}
    </span>
  );
}
