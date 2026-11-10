"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ArrowUpRightIcon, CheckIcon, CubeIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { FULL_MOTION, gsap, ScrollTrigger, useGSAP } from "../animations/gsap";

/** Example releases for the illustration; labelled as an example in the caption. */
const BLOCKS = [
  { version: "v1.2.0", date: "Sep 30", hash: "0x41be…07d1", verified: true },
  { version: "v1.3.0", date: "Oct 12", hash: "0x7a03…c9f2", verified: true },
  { version: "v1.3.1", date: "Oct 28", hash: "0xd2e8…5b14", verified: false },
  { version: "v1.4.0", date: "Nov 10", hash: "0x9c1f…a2e4", verified: true },
];

const FIELDS = [
  ["repo", "acme/widgets"],
  ["version", "v1.4.0"],
  ["fromCommit", "a41f9c2"],
  ["toCommit", "9be07d1"],
  ["notesHash", "0x9c1f…a2e4"],
  ["cid", "bafybei…fbzdi"],
] as const;

const HEX = "0123456789abcdef";

function Block({ b, last }: { b: (typeof BLOCKS)[number]; last: boolean }) {
  return (
    <li data-block className="relative grid grid-cols-[auto_1fr] gap-4">
      {/* Rail: node + the link to the next block */}
      <div className="relative flex flex-col items-center">
        <span
          className={`relative z-10 grid size-10 place-items-center rounded-xl ring-1 ${
            last ? "bg-violet text-white ring-violet" : "bg-white/[0.06] text-white/80 ring-white/15"
          }`}
        >
          <CubeIcon className="size-4.5" />
          {last && <span data-pulse className="absolute inset-0 rounded-xl ring-2 ring-violet/60" />}
        </span>
        {!last && (
          <span className="relative mt-1 w-px flex-1 bg-white/10">
            <span data-link className="absolute inset-0 origin-top bg-linear-to-b from-violet to-violet/30" />
          </span>
        )}
      </div>

      <div
        data-spotlight="dark"
        className={`mb-4 rounded-2xl p-4 ring-1 transition-colors ${
          last ? "bg-white/[0.08] ring-violet/50" : "bg-white/[0.035] ring-white/10 hover:bg-white/[0.06]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[15px] font-semibold text-white">
            {b.version} <span className="ml-1 font-sans text-xs font-normal text-white/45">{b.date}</span>
          </p>
          {b.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-new/15 px-2 py-0.5 text-[11px] font-medium text-[#6ee7a0]">
              <ShieldCheckIcon className="size-3" /> Verified
            </span>
          ) : (
            <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px] text-white/55">Unverified</span>
          )}
        </div>
        <p className="mt-2 font-mono text-xs text-white/45">
          notesHash <span data-hash={b.hash} className="text-white/80">{b.hash}</span>
        </p>
      </div>
    </li>
  );
}

/**
 * The dark band: what "recorded on BOT Chain" means, shown as a chain of release blocks that
 * link up as you scroll, ending on the newest release with its hash being sealed.
 */
export function OnChainBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const q = gsap.utils.selector(root);
        const blocks = q("[data-block]");
        const links = q("[data-link]");
        const fields = q("[data-field]");

        gsap.set(blocks, { opacity: 0, x: 28 });
        gsap.set(links, { scaleY: 0 });
        gsap.set(fields, { opacity: 0, x: -10 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: q("[data-chain]")[0], start: "top 75%", end: "bottom 60%", scrub: 0.8 },
        });
        blocks.forEach((block, i) => {
          tl.to(block, { opacity: 1, x: 0, duration: 1, ease: "power2.out" });
          if (links[i]) tl.to(links[i], { scaleY: 1, duration: 0.8, ease: "none" }, "-=0.3");
        });

        ScrollTrigger.create({
          trigger: q("[data-fields]")[0],
          start: "top 80%",
          once: true,
          onEnter: () => gsap.to(fields, { opacity: 1, x: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }),
        });

        // Hashes scramble before settling, like a value being computed.
        const hashes = q("[data-hash]");
        const scramble = ScrollTrigger.create({
          trigger: q("[data-chain]")[0],
          start: "top 70%",
          once: true,
          onEnter: () => {
            hashes.forEach((el, i) => {
              const final = el.dataset.hash!;
              const state = { p: 0 };
              gsap.to(state, {
                p: 1,
                duration: 1.1,
                delay: i * 0.25,
                ease: "power1.in",
                onUpdate: () => {
                  const keep = Math.floor(state.p * final.length);
                  el.textContent = [...final]
                    .map((ch, j) => (j < keep || ch === "…" || j < 2 ? ch : HEX[Math.floor(Math.random() * 16)]))
                    .join("");
                },
                onComplete: () => {
                  el.textContent = final;
                },
              });
            });
          },
        });

        gsap.to(q("[data-pulse]"), { scale: 1.35, opacity: 0, duration: 1.6, repeat: -1, ease: "power2.out" });
        return () => scramble.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-nav-dark aria-labelledby="onchain-title" className="relative isolate overflow-hidden border-b border-ink bg-ink text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/3 h-[30rem] w-[40rem] rounded-full bg-violet/35 blur-[140px]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-14 border-white/10 px-5 py-24 sm:border-x sm:px-10 sm:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="onchain-title" className="text-[clamp(2.1rem,4.8vw,3.75rem)] leading-[1.02] tracking-[-0.04em]">
            <span className="text-white/50">Every release,</span> sealed on <span className="text-[#b9a8ff]">BOT Chain</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            Notes go to IPFS. Their fingerprint goes on-chain with the repo, version and commit range. Edit one word
            later and the hash no longer matches.
          </p>

          <dl data-fields className="mt-9 grid max-w-md gap-px overflow-hidden rounded-2xl bg-white/10 font-mono text-[13px] ring-1 ring-white/10">
            {FIELDS.map(([k, v]) => (
              <div key={k} data-field className="flex items-center justify-between gap-4 bg-ink/95 px-4 py-2.5">
                <dt className="text-white/45">{k}</dt>
                <dd className="truncate text-white/90">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/app" variant="light">
              Record a release
            </ButtonLink>
            <ButtonLink external href={siteConfig.links.botChain} variant="ghostLight">
              About BOT Chain <ArrowUpRightIcon className="size-3.5" />
            </ButtonLink>
          </div>
        </div>

        <figure>
          <ol data-chain aria-label="Example release history for acme/widgets" className="grid">
            {BLOCKS.map((b, i) => (
              <Block key={b.version} b={b} last={i === BLOCKS.length - 1} />
            ))}
          </ol>
          <figcaption className="mt-2 flex items-center gap-2 pl-14 text-sm text-white/50">
            <CheckIcon className="size-4 text-[#b9a8ff]" />
            Example history. Anyone can verify it; nobody can quietly rewrite it.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
