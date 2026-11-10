import { GROUPS, type Group } from "@/lib/changelog/types";
import { cn } from "@/lib/utils/cn";
import { Chip, type ChipTone } from "./chip";
import { GroupIcon } from "./icons";

/** "New / Improved / Fixed / Breaking" chip with its drawn icon (emoji stay in plain-text outputs only). */
export function GroupBadge({ group, className, label }: { group: Group; className?: string; label?: string }) {
  const meta = GROUPS.find((g) => g.id === group)!;
  return (
    <Chip tone={group as ChipTone} className={cn("pr-3", className)}>
      <GroupIcon group={group} className="size-3.5" />
      {label ?? meta.label}
    </Chip>
  );
}
