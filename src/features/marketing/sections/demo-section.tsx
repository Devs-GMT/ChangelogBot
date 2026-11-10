import { HeroDemo } from "../hero-demo/hero-demo";
import { Reveal } from "../animations/reveal";
import { Pad, Section, SectionHeading } from "./section-shell";

/** The tabbed product demo: commits sort themselves, notes rewrite, the release gets recorded. */
export function DemoSection() {
  return (
    <Section>
      <Reveal>
        <Pad className="py-16 sm:py-20">
          <SectionHeading
            align="center"
            title="Watch a release **write itself**"
            description="Messy commits sort into groups, turn into sentences people understand, and get recorded on BOT Chain."
          />
        </Pad>
      </Reveal>
      <HeroDemo />
    </Section>
  );
}
