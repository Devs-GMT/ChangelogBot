import { Suspense } from "react";
import { ConnectCards } from "@/features/marketing/sections/connect-cards";
import { DemoSection } from "@/features/marketing/sections/demo-section";
import { FinalCta } from "@/features/marketing/sections/final-cta";
import { Navbar } from "@/features/marketing/layout/navbar";
import { Hero } from "@/features/marketing/sections/hero";
import { OnChainBand } from "@/features/marketing/sections/onchain-band";
import { PlatformCards } from "@/features/marketing/sections/platform-cards";
import { RepoStrip } from "@/features/marketing/sections/repo-strip";
import { Spacer } from "@/features/marketing/sections/section-shell";
import { SetupSteps } from "@/features/marketing/sections/setup-steps";
import { WriteLess } from "@/features/marketing/sections/write-less";

export default function HomePage() {
  return (
    <>
      <Navbar startDark />
      <main>
        <Hero />
        <Suspense
          fallback={
            <div
              className="h-[9.5rem] border-b border-line"
              aria-hidden="true"
            />
          }
        >
          <RepoStrip />
        </Suspense>
        <DemoSection />
        <ConnectCards />
        <Spacer />
        <WriteLess />
        <OnChainBand />
        <PlatformCards />
        <SetupSteps />
        <Spacer />
        <FinalCta />
      </main>
    </>
  );
}
