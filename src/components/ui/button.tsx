import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "light" | "ghostLight";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-violet text-white shadow-sm hover:bg-violet-hover",
  secondary: "bg-paper text-ink border border-line hover:bg-canvas",
  ghost: "text-muted hover:text-ink hover:bg-canvas",
  /** For dark surfaces */
  light: "bg-white text-ink shadow-[0_10px_30px_-10px_rgb(255_255_255/0.5)] hover:bg-white/90",
  ghostLight: "text-white/70 hover:bg-white/10 hover:text-white",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-btn font-medium whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

type Common = { variant?: Variant; size?: Size; className?: string; children: React.ReactNode };

export function Button({
  variant,
  size,
  className,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  external,
  href,
  children,
  ...props
}: Common & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = buttonClass(variant, size, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}
