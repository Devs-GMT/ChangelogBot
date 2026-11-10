"use client";

import { useRef } from "react";
import { FileBox } from "@/components/ui/file-box";
import { GitHubIcon } from "@/components/ui/icons";
import { FULL_MOTION, gsap, ScrollTrigger, useGSAP } from "../animations/gsap";
import { Pad, Section, SectionHeading } from "./section-shell";

const STEPS = [
  {
    n: "01",
    title: "Paste your repo",
    body: "Any public GitHub repo. Tags, PRs and commits are read right in your browser.",
    visual: (
      <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 font-mono text-xs">
        <GitHubIcon className="size-3.5 text-muted" /> acme/widgets
      </div>
    ),
  },
  {
    n: "02",
    title: "Add .changelogbot",
    body: "Put your wallet address in a .changelogbot file to get the Verified badge.",
    visual: (
      <FileBox name=".changelogbot" className="shadow-none" bodyClassName="p-3 text-xs">
        0x12ab…9f3c
      </FileBox>
    ),
  },
  {
    n: "03",
    title: "Publish your first release",
    body: "Edit the notes, press publish, and the record lands on BOT Chain.",
    visual: (
      <div className="flex items-center justify-between rounded-lg bg-violet px-3 py-2 text-xs font-medium text-white">
        Publish release <span className="font-mono opacity-80">v1.0.0</span>
      </div>
    ),
  },
];

export function SetupSteps() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const nums = gsap.utils.toArray<HTMLElement>("[data-num]", root.current);
        gsap.set(nums, { rotationX: -90, opacity: 0, transformPerspective: 600, transformOrigin: "50% 100%" });
        const trigger = ScrollTrigger.create({
          trigger: root.current,
          start: "top 80%",
          once: true,
          onEnter: () =>
            gsap.to(nums, { rotationX: 0, opacity: 1, duration: 0.8, ease: "back.out(1.6)", stagger: 0.18 }),
        });
        return () => trigger.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="how-it-works">
      <Pad className="py-20 sm:py-24">
        <SectionHeading title="Set up in **3 steps**" description="No account, no database, no install. The order matters, so the steps are numbered." />
      </Pad>
      <div
        ref={root}
        className="grid gap-px border-t border-line bg-line md:grid-cols-3"
      >
        {STEPS.map((s) => (
          <article key={s.n} data-spotlight className="flex flex-col bg-paper p-6 sm:p-10">
            <span
              data-num
              className="inline-block font-display text-7xl font-semibold leading-none tracking-[-0.06em] text-violet sm:text-8xl"
            >
              {s.n}
            </span>
            <h3 className="mt-6 text-xl">{s.title}</h3>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{s.body}</p>
            <div className="mt-6">{s.visual}</div>
          </article>
        ))}
      </div>
    </Section>
  );
}
