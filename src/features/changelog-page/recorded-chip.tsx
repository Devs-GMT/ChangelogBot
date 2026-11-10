import { Chip } from "@/components/ui/chip";
import { ArrowUpRightIcon, CheckIcon } from "@/components/ui/icons";
import { shortAddress } from "@/lib/utils/format";

export interface Recorded {
  verified: boolean;
  publisher: string;
  explorerUrl: string;
}

/** "✓ Recorded on BOT Chain" with verification status, linking to the explorer. */
export function RecordedChip({ recorded }: { recorded: Recorded }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={recorded.explorerUrl} target="_blank" rel="noopener noreferrer" className="rounded-full">
        <Chip tone="violet" className="hover:bg-violet/10">
          <CheckIcon className="size-3.5" /> Recorded on BOT Chain <ArrowUpRightIcon className="size-3" />
        </Chip>
      </a>
      {recorded.verified ? (
        <Chip tone="new">
          <CheckIcon className="size-3.5" /> Verified maintainer
        </Chip>
      ) : (
        <span className="text-xs text-muted">Published by {shortAddress(recorded.publisher)} (not verified)</span>
      )}
    </div>
  );
}
