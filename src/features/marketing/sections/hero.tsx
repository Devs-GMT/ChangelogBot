import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, PlayIcon } from "@/components/ui/icons";
import { ReleaseEngine } from "../hero-engine/release-engine";
import { TwoTone } from "./section-shell";

/**
 * Dark hero: the headline, then the release engine — commits in, a release block in the middle,
 * finished outputs out. `data-nav-dark` tells the navbar to switch to its dark style over it.
 */
export function Hero() {
  return (
    <section data-nav-dark className="relative isolate -mt-16 overflow-hidden bg-ink text-white sm:-mt-20">
      {/* Dawn: sky-blue light from the top edge, fading through violet to black before the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgb(125_211_252/0.17),rgb(110_86_207/0.09)_45%,transparent_78%)]"
      />
      {/* Horizon: a thin bright line under the navbar with a soft bloom */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
        <span className="h-px w-[70%] bg-[linear-gradient(90deg,transparent,rgb(186_230_253/0.5),transparent)]" />
        <span className="absolute top-0 h-24 w-[50%] -translate-y-1/2 rounded-[50%] bg-sky-300/12 blur-3xl" />
      </div>
      {/* Light from below the engine, quieter so the top leads */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[42rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(110_86_207/0.26),transparent)]"
      />

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-10 sm:pb-24 sm:pt-44">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="rise text-[clamp(2.7rem,7.2vw,6.25rem)] leading-[0.98] tracking-[-0.05em] text-white/45"
            style={{ ["--i" as string]: 0 }}
          >
            <TwoTone text="The **changelog writer** built for the **AI era**" strongClassName="text-white" />
          </h1>
          <p
            className="rise mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-white/60 sm:text-lg"
            style={{ ["--i" as string]: 1 }}
          >
            Pick two versions. ChangelogBot reads your commits, writes release notes people enjoy, and records every
            release on BOT Chain.
          </p>
          <div
            className="rise mt-9 grid gap-3 sm:flex sm:items-center sm:justify-center"
            style={{ ["--i" as string]: 2 }}
          >
            <ButtonLink href="/app" size="lg" variant="light" className="group">
              Write my changelog
              <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="#demo" size="lg" variant="ghostLight" className="ring-1 ring-white/15">
              <PlayIcon className="size-3.5" /> Watch it work
            </ButtonLink>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <ReleaseEngine />
        </div>
      </div>
    </section>
  );
}
