import { cn } from "@/lib/utils/cn";

/**
 * Simple BOT Chain mark used until the official logo file is dropped into /public/brand.
 * Callers wrap it in a link to botchain.ai.
 */
export function BotChainLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-sm font-semibold", className)}>
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.6" fill="currentColor" />
      </svg>
      BOT Chain
    </span>
  );
}
