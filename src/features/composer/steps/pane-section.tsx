import { cn } from "@/lib/utils/cn";

/** One block of the sidebar: a small uppercase label, an optional action, then the content. */
export function PaneSection({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className={cn("rise border-b border-line px-5 py-5", className)}>
      <div className="mb-3.5 flex min-h-6 items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
