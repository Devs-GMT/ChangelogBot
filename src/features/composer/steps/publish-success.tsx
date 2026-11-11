"use client";

import { ArrowUpRightIcon, CheckIcon, XLogoIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { txExplorerUrl } from "@/config/contract";
import { xIntentUrl } from "@/lib/changelog/outputs";
import { useOrigin } from "@/lib/hooks/use-origin";

const COLORS = ["#6e56cf", "#8b74ff", "#16a34a", "#2563eb", "#ea580c", "#d9cfff"];
const PIECES = Array.from({ length: 22 }, (_, i) => ({
  dx: Math.round(Math.cos((i / 22) * Math.PI * 2) * (70 + (i % 4) * 22)),
  dy: Math.round(Math.sin((i / 22) * Math.PI * 2) * (50 + (i % 3) * 18) + 40),
  r: `${(i % 2 ? 1 : -1) * (180 + i * 24)}deg`,
  color: COLORS[i % COLORS.length],
}));

/** Shown once the release is on chain: a small celebration, then the three things people do next. */
export function PublishSuccess({ repo, version, txHash }: { repo: string; version: string; txHash?: string }) {
  const origin = useOrigin();
  const pageUrl = `${origin}/c/${repo}`;
  const shareText = `${repo} ${version} is out, and its release notes are now recorded on BOT Chain.\n\n${pageUrl}`;

  return (
    <section
      aria-label="Published"
      className="rise relative overflow-hidden border-t border-new/30 bg-gradient-to-b from-new-soft/70 to-paper p-5 text-center"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-9 size-0">
        {PIECES.map((p, i) => (
          <i
            key={i}
            className="confetti absolute size-1.5 rounded-[2px] motion-reduce:hidden"
            style={{ background: p.color, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--r" as string]: p.r, ["--i" as string]: i % 6 }}
          />
        ))}
      </div>

      <span className="pop-in mx-auto grid size-14 place-items-center rounded-full bg-new text-white shadow-[0_12px_30px_-8px_rgb(22_163_74/0.6)]">
        <CheckIcon className="size-7" />
      </span>
      <h2 className="mt-4 text-xl tracking-[-0.03em]">Recorded on BOT Chain</h2>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">
        <strong className="font-semibold text-ink">{version}</strong> is now part of the permanent history of{" "}
        <strong className="font-semibold text-ink">{repo}</strong>.
      </p>

      <div className="mt-5 grid gap-2">
        <ButtonLink href={`/c/${repo}`} size="lg">
          View changelog page
        </ButtonLink>
        <div className="grid grid-cols-2 gap-2">
          <ButtonLink external size="sm" variant="secondary" href={xIntentUrl(shareText)}>
            <XLogoIcon className="size-3.5" /> Share on X
          </ButtonLink>
          {txHash ? (
            <ButtonLink external size="sm" variant="secondary" href={txExplorerUrl(txHash)}>
              Transaction <ArrowUpRightIcon className="size-3.5" />
            </ButtonLink>
          ) : (
            <span />
          )}
        </div>
        <div className="flex justify-center">
          <CopyButton text={pageUrl} label="Copy page link" />
        </div>
      </div>
    </section>
  );
}
