"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, GitHubIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { MenuIcon } from "@/components/ui/menu-icon";
import { siteConfig } from "@/config/site";
import { ConnectButton } from "@/features/wallet/connect-button";
import { cn } from "@/lib/utils/cn";

/**
 * Whether the page has left the top, how far through it the reader is (0–1), and whether a
 * section marked [data-nav-dark] is currently under the bar.
 */
function useScroll(startDark: boolean) {
  const [state, setState] = useState({ scrolled: false, progress: 0, dark: startDark });
  useEffect(() => {
    let frame = 0;
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const line = document.querySelector<HTMLElement>("[data-site-nav]")?.getBoundingClientRect().bottom ?? 0;
      const dark = [...document.querySelectorAll<HTMLElement>("[data-nav-dark]")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= line + 1 && r.bottom > line;
      });
      setState({ scrolled: window.scrollY > 12, progress: max > 0 ? Math.min(1, window.scrollY / max) : 0, dark });
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    };
    onScroll();
    // Re-check once layout has settled (fonts, images), so the bar starts in the right colour.
    const settle = window.setTimeout(onScroll, 250);
    window.addEventListener("load", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("load", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return state;
}

/** Which in-page section (by nav hash) sits in the middle of the viewport. */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const SECTION_IDS = siteConfig.nav.map((n) => n.href.split("#")[1] ?? "").filter(Boolean);

/**
 * Links sit in one pill; a highlight slides to whichever link is hovered, falling back to the
 * section currently on screen.
 */
function PillNav({ active, dark }: { active: string | null; dark: boolean }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  const activeIndex = siteConfig.nav.findIndex((n) => active !== null && n.href.endsWith(`#${active}`));
  const target = hover ?? (activeIndex >= 0 ? activeIndex : null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || target === null) return setBox(null);
    const el = list.children[target + 1] as HTMLElement | undefined; // child 0 is the highlight
    if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
  }, [target]);

  return (
    <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
      <div
        ref={listRef}
        onMouseLeave={() => setHover(null)}
        className={cn(
          "relative flex items-center rounded-full border p-1 transition-colors duration-300",
          dark ? "border-white/10 bg-white/[0.04]" : "border-line bg-canvas/70",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-1 rounded-full transition-all duration-300 ease-[var(--ease-out-expo)]",
            dark
              ? "bg-white/10 ring-1 ring-white/10"
              : "bg-paper shadow-[0_1px_2px_rgb(17_19_24/0.06),0_4px_12px_-4px_rgb(17_19_24/0.12)] ring-1 ring-line",
            box ? "opacity-100" : "opacity-0",
          )}
          style={box ? { left: box.left, width: box.width } : undefined}
        />
        {siteConfig.nav.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-current={i === activeIndex ? "location" : undefined}
            className={cn(
              "relative rounded-full px-5 py-2 text-[15px] transition-colors duration-200",
              dark
                ? i === target ? "text-white" : "text-white/55 hover:text-white"
                : i === target ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** `startDark`: the page opens on a dark section, so render dark from the first paint (no flash). */
export function Navbar({ startDark = false }: { startDark?: boolean }) {
  const { scrolled, progress, dark: overDark } = useScroll(startDark);
  const active = useActiveSection(SECTION_IDS);
  // Every link in the menu closes it on click, so no route listener is needed.
  const [open, setOpen] = useState(false);
  // Over a dark section the bar goes dark too; the open mobile menu is always light.
  const dark = overDark && !open;

  // Lock page scroll while the menu is open; Esc closes it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Announcement strip: scrolls away; the bar below sticks */}
      {/* <div className="bg-ink text-white">
        <Link
          href="/app"
          className="group mx-auto flex h-10 w-full max-w-7xl items-center justify-center gap-2 px-4 text-[13px] sm:text-sm"
        >
          <span className="size-1.5 rounded-full bg-[#b9a8ff]" aria-hidden="true" />
          <span className="font-medium">Every release, recorded on BOT Chain</span>
          <span className="text-white/55 transition-colors group-hover:text-white max-sm:hidden">Write your first changelog</span>
          <ArrowRightIcon className="size-3.5 text-white/55 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
        </Link>
      </div> */}

      <header
        data-site-nav
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,color] duration-300",
          dark
            ? cn(
                "text-white",
                // At the very top the bar is clear, so the hero's light reaches it.
                scrolled ? "border-white/10 bg-ink/75 backdrop-blur-xl backdrop-saturate-150" : "border-white/[0.06] bg-transparent",
              )
            : scrolled || open
              ? "border-line bg-paper/80 shadow-[0_8px_30px_-18px_rgb(17_19_24/0.25)] backdrop-blur-xl backdrop-saturate-150"
              : "border-line bg-paper",
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 transition-[height] duration-300 ease-[var(--ease-out-expo)] sm:px-8 lg:px-10",
            scrolled && !open ? "h-16" : "h-16 sm:h-20",
          )}
        >
          <Link href="/" aria-label="ChangelogBot home" className="rounded-md" onClick={() => setOpen(false)}>
            <Logo className="text-[19px] sm:text-xl" markClassName="size-8 sm:size-9" />
          </Link>

          <PillNav active={active} dark={dark} />

          <div className="flex items-center gap-2">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ChangelogBot on GitHub"
              className={cn(
                "hidden size-10 place-items-center rounded-full transition-colors xl:grid",
                dark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-canvas hover:text-ink",
              )}
            >
              <GitHubIcon className="size-[18px]" />
            </a>
            <div className="hidden xl:block">
              <ConnectButton />
            </div>
            <ButtonLink
              href="/app"
              className="group rounded-full! pl-5 pr-4 shadow-[0_6px_20px_-8px_rgb(110_86_207/0.8)] max-sm:hidden"
            >
              Write my changelog
              <span className="grid size-5 place-items-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRightIcon className="size-3" />
              </span>
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "-mr-1 grid size-10 place-items-center rounded-full border lg:hidden",
                dark ? "border-white/15 text-white hover:bg-white/10" : "border-line text-ink hover:bg-canvas",
              )}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>

        {/* Reading progress along the bottom hairline */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left bg-violet transition-opacity duration-300",
            scrolled && !open ? "opacity-100" : "opacity-0",
          )}
          style={{ transform: `scaleX(${progress})` }}
        />

        <div
          id="mobile-menu"
          hidden={!open}
          className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper px-5 pb-8 pt-2 sm:px-8 lg:hidden"
        >
          <nav aria-label="Mobile" className="grid">
            {siteConfig.nav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rise flex items-center justify-between border-b border-line py-5 font-display text-3xl font-semibold tracking-[-0.03em]"
                style={{ ["--i" as string]: i }}
              >
                {item.label}
                <ArrowRightIcon className="size-5 text-muted" />
              </Link>
            ))}
          </nav>
          <div className="rise mt-8 grid gap-3" style={{ ["--i" as string]: siteConfig.nav.length }}>
            <ButtonLink href="/app" size="lg" className="w-full" onClick={() => setOpen(false)}>
              Write my changelog
            </ButtonLink>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted">{siteConfig.description}</p>
        </div>
      </header>
    </>
  );
}
