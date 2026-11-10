import { Suspense } from "react";
import { Footer } from "@/features/marketing/layout/footer";
import { SpotlightLayer } from "@/features/marketing/animations/spotlight-layer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SpotlightLayer />
      <div className="min-h-[70dvh]">{children}</div>
      <Suspense fallback={<div className="h-96 border-t border-line" aria-hidden="true" />}>
        <Footer />
      </Suspense>
    </>
  );
}
