import { cn } from "@/lib/utils/cn";

/**
 * ChangelogBot's mark: three release notes stacked (older behind, newest in front),
 * the front one carrying lines of text and the AI sparkle.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className ?? "size-7"} aria-hidden="true">
      <rect x="16" y="6" width="40" height="26" rx="8" fill="#E4DDFF" />
      <rect x="11" y="16" width="42" height="27" rx="8" fill="#B9A8FF" />
      <rect x="6" y="27" width="46" height="31" rx="9" fill="#6E56CF" />
      <rect x="6" y="27" width="46" height="31" rx="9" fill="none" stroke="#fff" strokeOpacity="0.18" />
      <path d="M16 37.5h18M16 44h26M16 50.5h12" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M46 34l1.6 3.9 3.9 1.6-3.9 1.6L46 45l-1.6-3.9-3.9-1.6 3.9-1.6L46 34Z" fill="#fff" />
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
