import { Fragment } from "react";
import { cn } from "@/lib/utils/cn";
import { ReleaseBlocks } from "../illustrations/release-blocks";

/**
 * The page is built on a frame: two hairline rails run down the whole page at the container edges,
 * and every section is a band between horizontal hairlines. Content that should touch the rails
 * (cell grids) sits directly in <Frame>; text gets <Pad>.
 */
export function Frame({ className, children, dark }: { className?: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl sm:border-x", dark ? "border-white/10" : "border-line", className)}>
      {children}
    </div>
  );
}

export const padX = "px-5 sm:px-10 xl:px-12";

export function Pad({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn(padX, className)}>{children}</div>;
}

export function Section({
  id,
  className,
  frameClassName,
  children,
  tone = "paper",
  blocks,
}: {
  id?: string;
  className?: string;
  frameClassName?: string;
  children: React.ReactNode;
  tone?: "paper" | "canvas";
  /** A small cluster of floating release blocks in the section's top-right corner (wide screens). */
  blocks?: "small" | "pair";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate scroll-mt-16 overflow-hidden border-b border-line",
        tone === "canvas" && "bg-canvas",
        className,
      )}
    >
      <Frame className={cn("relative", frameClassName)}>
        {blocks && (
          <ReleaseBlocks scene={blocks} className="absolute right-6 top-8 -z-10 hidden w-44 opacity-90 lg:block xl:right-10 xl:w-52" />
        )}
        {children}
      </Frame>
    </section>
  );
}

/** A soft tinted strip between sections, inside the rails. Purely structural. */
export function Spacer({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("border-b border-line", className)}>
      <Frame className="h-10 bg-canvas sm:h-14">{null}</Frame>
    </div>
  );
}

/**
 * Two-tone heading: words wrapped in **double asterisks** are set in ink, the rest in muted grey.
 */
export function TwoTone({ text, strongClassName = "text-ink" }: { text: string; strongClassName?: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={strongClassName}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function SectionHeading({
  title,
  description,
  align = "split",
  className,
}: {
  /** Supports **ink** emphasis; everything else renders muted. */
  title: string;
  description?: string;
  align?: "center" | "split";
  className?: string;
}) {
  const heading = (
    <h2 className="text-[clamp(2rem,4.4vw,3.35rem)] leading-[1.04] tracking-[-0.04em] text-muted">
      <TwoTone text={title} />
    </h2>
  );
  if (align === "center") {
    return (
      <div data-reveal className={cn("mx-auto max-w-2xl text-center", className)}>
        {heading}
        {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
      </div>
    );
  }
  return (
    <div data-reveal className={cn("grid grid-cols-1 items-end gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16", className)}>
      {heading}
      {description && <p className="max-w-md text-base leading-relaxed text-muted lg:justify-self-end">{description}</p>}
    </div>
  );
}

/** Hairline cell grid that runs edge to edge between the rails. */
export function Cells({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-px border-t border-line bg-line", className)}>{children}</div>;
}

/** One cell: a visual on top, then a caption whose first phrase is set in ink. */
export function Cell({
  icon: Icon,
  title,
  body,
  className,
  visualClassName,
  children,
}: {
  icon?: (p: { className?: string }) => React.ReactElement;
  title: string;
  body: string;
  className?: string;
  visualClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      data-reveal
      data-spotlight
      className={cn("flex flex-col bg-paper p-6 transition-colors duration-300 hover:bg-[#fcfcfd] sm:p-8", className)}
    >
      {children && <div className={cn("mb-8 flex flex-1 flex-col justify-center", visualClassName)}>{children}</div>}
      <p className="flex gap-2.5 text-[15px] leading-relaxed text-muted">
        {Icon && <Icon className="mt-[3px] size-4 shrink-0 text-ink" />}
        <span>
          <strong className="font-medium text-ink">{title}</strong> {body}
        </span>
      </p>
    </article>
  );
}
