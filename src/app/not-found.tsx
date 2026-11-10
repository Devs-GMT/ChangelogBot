import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { FileBox } from "@/components/ui/file-box";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { ReleaseBlocks } from "@/features/marketing/illustrations/release-blocks";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-paper px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-12rem] h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-violet/[0.12] blur-[110px]"
      />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col py-8">
        <Link href="/" aria-label="ChangelogBot home" className="w-fit rounded-md">
          <Logo />
        </Link>

        <div className="my-auto py-16 text-center">
          <ReleaseBlocks scene="small" className="rise mx-auto w-48 sm:w-56" />
          <p className="rise mt-6 font-mono text-sm text-muted" aria-hidden="true">
            404 · release not found
          </p>
          <h1 className="rise mt-2 text-[clamp(2rem,5vw,3rem)] leading-tight tracking-[-0.04em]" style={{ ["--i" as string]: 1 }}>
            This page is not in the changelog
          </h1>
          <p className="rise mx-auto mt-3 max-w-md text-muted" style={{ ["--i" as string]: 2 }}>
            The link may be wrong, or the page was moved. Nothing was recorded at this address.
          </p>

          <FileBox
            name="terminal"
            className="rise mx-auto mt-9 max-w-md text-left shadow-lift"
            bodyClassName="grid gap-1 text-[12.5px]"
          >
            <p>
              <span className="text-violet">$</span> git checkout this-page
            </p>
            <p className="text-breaking">error: pathspec did not match any file known to git</p>
            <p>
              <span className="text-violet">$</span> cd ~<span className="caret-blink ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-ink" aria-hidden="true" />
            </p>
          </FileBox>

          <div className="rise mt-9 flex flex-col justify-center gap-3 sm:flex-row" style={{ ["--i" as string]: 4 }}>
            <ButtonLink href="/" size="lg">
              Back home
            </ButtonLink>
            <ButtonLink href="/app" size="lg" variant="secondary" className="group">
              Write a changelog
              <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
