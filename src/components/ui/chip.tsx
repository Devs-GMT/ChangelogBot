import { cn } from "@/lib/utils/cn";

export type ChipTone = "neutral" | "violet" | "new" | "improved" | "fixed" | "breaking";

const tones: Record<ChipTone, string> = {
  neutral: "bg-canvas text-muted border-line",
  violet: "bg-violet-soft text-violet border-violet/20",
  new: "bg-new-soft text-new border-new/20",
  improved: "bg-improved-soft text-improved border-improved/20",
  fixed: "bg-fixed-soft text-fixed border-fixed/20",
  breaking: "bg-breaking-soft text-breaking border-breaking/20",
};

export function Chip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
