import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, BugIcon, SparkleIcon, TrendIcon } from "@/components/ui/icons";
import { Reveal } from "../animations/reveal";
import { Section } from "./section-shell";

/** Release tags riding two orbits behind the headline. Pure CSS rotation; still under reduced motion. */
const RINGS = [
  { size: "size-[34rem] sm:size-[46rem]", duration: "70s", tags: ["v1.4.0", "v2.0.0-rc.1", "v0.9.3"] },
  { size: "size-[52rem] sm:size-[66rem]", duration: "110s", tags: ["v1.3.1", "v3.2.0", "v1.0.0", "v0.1.0"] },
];

function Orbits() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {RINGS.map((ring) => (
        <div
          key={ring.duration}
          className={`orbit absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07] ${ring.size}`}
          style={{ ["--orbit-duration" as string]: ring.duration }}
        >
          {ring.tags.map((tag, i) => {
            const angle = (360 / ring.tags.length) * i + 20;
            return (
              <div key={tag} className="absolute inset-0" style={{ rotate: `${angle}deg` }}>
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" style={{ rotate: `${-angle}deg` }}>
                  <span
                    className="orbit-counter block rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-white/55"
                    style={{ ["--orbit-duration" as string]: ring.duration }}
                  >
                    {tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** The closing dark panel: a deliberate full stop before the footer. */
export function FinalCta() {
  return (
    <Section>
      <div className="p-3 sm:p-4">
      <Reveal>
        <div
          data-reveal
          data-spotlight="dark"
          className="relative isolate overflow-hidden rounded-2xl bg-ink px-6 py-24 text-center text-white sm:py-32"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-violet/60 blur-[120px]"
          />
          <Orbits />

          <div className="relative">
            <ul aria-hidden="true" className="mb-8 flex justify-center gap-2">
              {[
                { Icon: SparkleIcon, c: "text-[#6ee7a0]", r: "-rotate-6" },
                { Icon: TrendIcon, c: "text-[#93b4ff]", r: "rotate-3" },
                { Icon: BugIcon, c: "text-[#ffb27a]", r: "-rotate-2" },
              ].map(({ Icon, c, r }, i) => (
                <li
                  key={i}
                  className={`float-y grid size-11 place-items-center rounded-xl bg-white/[0.07] ring-1 ring-white/10 ${r}`}
                  style={{ ["--i" as string]: i }}
                >
                  <Icon className={`size-5 ${c}`} />
                </li>
              ))}
            </ul>
            <h2 className="mx-auto max-w-3xl text-[clamp(2.2rem,5.6vw,4.25rem)] leading-[1.02] tracking-[-0.04em]">
              <span className="text-white/50">Ship it. Tell everyone.</span> Keep the record.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Your next release deserves notes people read, and a history nobody can rewrite.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/app"
                size="lg"
                variant="light"
                className="group"
              >
                Write my changelog
                <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </ButtonLink>
              <span className="text-sm text-white/45">Free · no account needed</span>
            </div>
          </div>
        </div>
      </Reveal>
      </div>
    </Section>
  );
}
