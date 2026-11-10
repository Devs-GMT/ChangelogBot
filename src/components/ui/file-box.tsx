import { cn } from "@/lib/utils/cn";

/** A code-file card: small header with a file name, mono content below. */
export function FileBox({
  name,
  children,
  className,
  bodyClassName,
  action,
}: {
  name: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-paper shadow-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas px-4 py-2.5">
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span aria-hidden="true" className="flex gap-1">
            <i className="size-2 rounded-full bg-line" />
            <i className="size-2 rounded-full bg-line" />
            <i className="size-2 rounded-full bg-line" />
          </span>
          <span className="text-ink">{name}</span>
        </div>
        {action}
      </div>
      <div className={cn("p-4 font-mono text-[13px] leading-relaxed text-ink", bodyClassName)}>{children}</div>
    </div>
  );
}
