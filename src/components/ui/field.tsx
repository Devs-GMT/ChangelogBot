import { cn } from "@/lib/utils/cn";

export const inputClass =
  "h-10 w-full rounded-btn border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted/70 " +
  "transition-colors hover:border-muted/40 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20 " +
  "disabled:bg-canvas disabled:text-muted";

export function Field({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "error" | "warn";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-line bg-canvas text-muted",
    warn: "border-fixed/25 bg-fixed-soft text-ink",
    error: "border-breaking/25 bg-breaking-soft text-ink",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg border px-3 py-2 text-[13px]", tones[tone], className)}>
      {children}
    </div>
  );
}
