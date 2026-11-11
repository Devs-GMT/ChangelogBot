import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CubeIcon, GitHubIcon } from "@/components/ui/icons";
import { CONTRACT_EXPLORER_URL, isContractConfigured } from "@/config/contract";
import { ReleaseBlocks } from "@/features/marketing/illustrations/release-blocks";
import { ReleaseCard } from "@/features/changelog-page/release-card";
import { Navbar } from "@/features/marketing/layout/navbar";
import { getCachedReleasesFor } from "@/server/chain/queries";
import { fetchNotes } from "@/server/ipfs/fetch-notes";
import type { OnChainRelease } from "@/web3/contract";

type Params = { owner: string; repo: string };
const SEGMENT = /^[A-Za-z0-9-_.]{1,100}$/;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} changelog`,
    description: `Release notes for ${owner}/${repo}, recorded on BOT Chain.`,
  };
}

/** Verified releases first, newest first within each group. */
const order = (a: OnChainRelease, b: OnChainRelease) =>
  Number(b.verified) - Number(a.verified) || Number(b.at - a.at);

export default function ChangelogPage({ params }: { params: Promise<Params> }) {
  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-12 sm:pt-16">
        <Suspense fallback={<ChangelogSkeleton />}>
          <Changelog params={params} />
        </Suspense>
      </div>
    </>
  );
}

function ChangelogSkeleton() {
  return (
    <div role="status" aria-label="Loading changelog" className="grid gap-4">
      <div className="h-10 w-2/3 animate-pulse rounded-lg bg-canvas" />
      <div className="h-5 w-1/3 animate-pulse rounded-lg bg-canvas" />
      <div className="mt-8 h-48 animate-pulse rounded-2xl bg-canvas" />
    </div>
  );
}

async function Changelog({ params }: { params: Promise<Params> }) {
  const { owner, repo } = await params;
  if (!SEGMENT.test(owner) || !SEGMENT.test(repo)) notFound();
  const fullName = `${owner}/${repo}`;

  let releases: OnChainRelease[] = [];
  let chainError = false;
  try {
    releases = [...(await getCachedReleasesFor(fullName))].sort(order);
  } catch {
    chainError = true;
  }
  const verifiedCount = releases.filter((r) => r.verified).length;
  const withNotes = await Promise.all(
    releases.map(async (r) => ({
      release: r,
      notes: await fetchNotes(r.cid, r.notesHash),
    })),
  );

  return (
    <>
      <header className="relative overflow-hidden rounded-3xl border border-line bg-paper p-6 shadow-card sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-64 w-96 rounded-full bg-violet/[0.12] blur-[80px]"
        />
        <ReleaseBlocks scene="small" className="absolute -right-2 top-4 hidden w-44 opacity-90 md:block lg:w-52" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://github.com/${encodeURIComponent(owner)}.png?size=112`}
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-2xl border border-line bg-canvas"
            />
            <div className="min-w-0">
              <p className="font-mono text-sm text-muted">{owner} /</p>
              <h1 className="break-all text-3xl leading-tight sm:text-[2.6rem]">
                {repo}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink
              external
              size="sm"
              variant="secondary"
              href={`https://github.com/${fullName}`}
            >
              <GitHubIcon className="size-3.5" /> GitHub
            </ButtonLink>
            <ButtonLink size="sm" href="/app">
              Write a changelog
            </ButtonLink>
          </div>
        </div>
        <dl className="relative mt-7 flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1">
            <dt className="text-muted">Releases</dt>
            <dd className="tabular font-semibold">{releases.length}</dd>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1">
            <dt className="text-muted">Verified</dt>
            <dd className="tabular font-semibold">{verifiedCount}</dd>
          </div>
          {releases.length > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-violet/20 bg-violet-soft px-3 py-1 text-violet">
              <dt className="sr-only">Recorded on</dt>
              <dd className="flex items-center gap-1.5 font-medium">
                <CubeIcon className="size-3.5" /> Recorded on BOT Chain
              </dd>
            </div>
          )}
        </dl>
      </header>

      {chainError && (
        <p
          role="alert"
          className="mt-8 rounded-lg border border-breaking/25 bg-breaking-soft px-4 py-3 text-sm"
        >
          Could not read BOT Chain right now. Please refresh in a moment.
        </p>
      )}

      {!chainError && releases.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-canvas/50 p-10 text-center">
          <p className="font-display text-xl font-semibold">
            No releases recorded yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {isContractConfigured
              ? `Nobody has published notes for ${fullName} yet. Be the first.`
              : "The registry contract is not configured on this deployment yet."}
          </p>
          <ButtonLink href="/app" className="mt-5">
            Write my changelog
          </ButtonLink>
        </div>
      )}

      <div className="mt-6">
        {withNotes.map(({ release, notes }) => (
          <ReleaseCard
            key={`${release.publisher}-${release.version}`}
            version={release.version}
            date={new Date(Number(release.at) * 1000)
              .toISOString()
              .slice(0, 10)}
            notes={notes}
            recorded={{
              verified: release.verified,
              publisher: release.publisher,
              explorerUrl: CONTRACT_EXPLORER_URL,
            }}
          />
        ))}
      </div>
    </>
  );
}
