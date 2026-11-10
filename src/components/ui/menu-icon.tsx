import { cn } from "@/lib/utils/cn";

const bar = "absolute left-0 h-[1.75px] w-4 rounded-full bg-current transition-all duration-300 ease-[var(--ease-out-expo)]";

/** Two bars that cross into an X when `open`. */
export function MenuIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative block h-3 w-4", className)}>
      <i className={cn(bar, open ? "top-[5px] rotate-45" : "top-0.5")} />
      <i className={cn(bar, open ? "top-[5px] -rotate-45" : "top-[9px]")} />
    </span>
  );
}
