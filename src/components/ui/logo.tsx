import { cn } from "@/lib/utils/cn";

/**
 * ChangelogBot's mark: a "CB" monogram drawn as rounded strokes, like lines of a changelog,
 * on a blue badge.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className ?? "size-7"} aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#2563EB" />
      <g transform="translate(-2 0)" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 21H21a5 5 0 0 0-5 5v12a5 5 0 0 0 5 5h9" />
        <path d="M36 21v22M36 21h8a5.5 5.5 0 0 1 0 11h-8M36 32h10a5.5 5.5 0 0 1 0 11H36" />
      </g>
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-[17px] font-semibold tracking-tight", className)}>
      <LogoMark className={markClassName} />
      ChangelogBot
    </span>
  );
}
