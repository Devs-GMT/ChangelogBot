"use client";

import Link from "next/link";
import { ArrowUpRightIcon, CheckIcon } from "@/components/ui/icons";
import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CopyButton } from "@/components/ui/copy-button";
import { Notice } from "@/components/ui/field";
import { isContractConfigured, txExplorerUrl } from "@/config/contract";
import { ConnectButton } from "@/features/wallet/connect-button";
import { usePublishRelease } from "@/features/wallet/use-publish-release";
import { hashNotesJson, serializeNotes, shaToBytes20 } from "@/lib/changelog/notes-hash";
import { GitHubButton } from "@/features/github-auth/github-button";
import { useGitHubSession } from "@/features/github-auth/use-github-session";
import { checkMaintainerFile, checkPushAccess, type VerifyResult } from "@/lib/github/client";
import { getReleasesFor } from "@/web3/contract";
import { uploadNotes } from "../api";
import { PublishSuccess } from "./publish-success";
import { useComposer } from "../use-composer";

/** Keyed by wallet and GitHub login: switching either one means checking again. */
type Verification = { wallet: string; login: string | null; result: VerifyResult } | null;

const VERIFY_TEXT: Record<string, string> = {
  missing: "No .changelogbot file found on the default branch — this release will be published as unverified.",
  "wrong-wallet": "The .changelogbot file does not contain your connected wallet — this release will be published as unverified.",
  error: "Could not read the .changelogbot file right now — this release will be published as unverified.",
};

const PROGRESS = ["Verify", "IPFS", "Sign", "Confirm"];

/** Four short steps so the wait between "Publish" and "Recorded" never feels stuck. */
function PublishProgress({ active }: { active: number }) {
  return (
    <ol aria-label="Publish progress" className="grid grid-cols-4 gap-1.5">
      {PROGRESS.map((label, i) => (
        <li key={label} className="grid gap-1.5 text-center text-[11px]">
          <span
            className={`h-1 rounded-full ${i < active ? "bg-violet" : i === active ? "step-glow bg-violet" : "bg-line"}`}
          />
          <span className={i <= active ? "font-medium text-ink" : "text-muted"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export function PublishStep() {
  const { state } = useComposer();
  const { address, isConnected } = useAccount();
  const { publish, reset, status, error, txHash } = usePublishRelease();
  const github = useGitHubSession();
  const login = github.user?.login ?? null;

  const [verification, setVerification] = useState<Verification>(null);
  const [checking, setChecking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const cidCache = useRef<{ json: string; cid: string } | null>(null);

  const { notes, repo, repoRef } = state;
  if (!notes || !repo || !repoRef) return null;

  const visibleCount = notes.items.filter((i) => !i.hidden).length;
  const versionProblem = !notes.version.trim()
    ? "Add a version name."
    : notes.version.length > 20
      ? "Version must be 20 characters or fewer."
      : null;
  const emptyProblem = visibleCount === 0 ? "Add at least one visible note before publishing." : null;
  const blocker = versionProblem ?? emptyProblem;

  const wallet = address?.toLowerCase();
  const currentVerification =
    verification && verification.wallet === wallet && verification.login === login ? verification.result : null;

  /** `.changelogbot` first (ties this wallet to the repo); else push access of the signed-in GitHub user. */
  const verify = async (): Promise<VerifyResult | null> => {
    if (!address) return null;
    setChecking(true);
    let result = await checkMaintainerFile(repoRef, repo.defaultBranch, address);
    if (!result.verified && login && (await checkPushAccess(repoRef))) result = { verified: true, method: "github" };
    setVerification({ wallet: address.toLowerCase(), login, result });
    setChecking(false);
    return result;
  };

  const onPublish = async () => {
    setLocalError(null);
    reset();
    if (!address || blocker) return;

    // Cheap pre-check so nobody pays gas for a version their wallet already recorded.
    try {
      const existing = await getReleasesFor(notes.repo);
      if (existing.some((r) => r.publisher.toLowerCase() === wallet && r.version === notes.version)) {
        setLocalError(`${notes.version} is already recorded by your wallet for this repo — bump the version.`);
        return;
      }
    } catch {
      // read failed: the contract will still reject duplicates
    }

    const result = currentVerification ?? (await verify());

    let cid: string;
    const json = serializeNotes(notes);
    if (cidCache.current?.json === json) {
      cid = cidCache.current.cid;
    } else {
      setUploading(true);
      try {
        ({ cid } = await uploadNotes(json));
        cidCache.current = { json, cid };
      } catch (e) {
        setLocalError(`${e instanceof Error ? e.message : "IPFS upload failed."} Press publish to retry.`);
        return;
      } finally {
        setUploading(false);
      }
    }

    await publish({
      repo: notes.repo,
      version: notes.version,
      fromCommit: shaToBytes20(notes.fromCommit),
      toCommit: shaToBytes20(notes.toCommit),
      notesHash: hashNotesJson(json),
      cid,
      verified: result?.verified === true,
    });
  };

  const busy = uploading || checking || status === "switching" || status === "signing" || status === "pending";
  const label = uploading
    ? "Uploading notes to IPFS…"
    : checking
      ? "Checking .changelogbot…"
      : status === "switching"
        ? "Switching network…"
        : status === "signing"
          ? "Confirm in your wallet…"
          : status === "pending"
            ? "Waiting for confirmation…"
            : error || localError
              ? "Retry publish"
              : "Publish release";

  if (status === "success") {
    return <PublishSuccess repo={notes.repo} version={notes.version} txHash={txHash ?? undefined} />;
  }

  return (
    <section aria-label="Publish" className="rise grid gap-3 border-t border-line p-5">
      <div>
        <h2 className="text-[15px]">Publish &amp; record</h2>
        <p className="mt-1 text-[13px] text-muted">
          Uploads the notes to IPFS and records repo, version, commit range and notes hash on BOT Chain. It cannot be edited later.
        </p>
      </div>

      {!isContractConfigured && (
        <Notice tone="warn">Publishing is not available yet: the contract address is not configured.</Notice>
      )}

      <div className="grid gap-2 rounded-xl border border-line bg-canvas/60 p-3 text-[13px]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">Verified maintainer</span>
          {currentVerification?.verified && <Chip tone="new"><CheckIcon className="size-3.5" /> Verified</Chip>}
        </div>
        {currentVerification?.verified ? (
          currentVerification.method === "github" ? (
            <p className="text-muted">Signed in as <span className="font-medium text-ink">@{login}</span>, who can push to {repo.fullName}.</p>
          ) : (
            <p className="text-muted">Your wallet is listed in <code className="font-mono">.changelogbot</code> on {repo.defaultBranch}.</p>
          )
        ) : (
          <>
            <p className="text-muted">
              Add a file <code className="font-mono text-ink">.changelogbot</code> to your repo containing your wallet to get the Verified badge
              {github.configured ? ", or sign in with GitHub as someone who can push to this repo." : "."}
            </p>
            {github.configured && !login && (
              <div className="flex">
                <GitHubButton />
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-paper px-2 py-1 font-mono text-xs">{address}</code>
                <CopyButton text={address} />
              </div>
            )}
            {currentVerification && !currentVerification.verified && (
              <p className="text-fixed">{VERIFY_TEXT[currentVerification.reason]}</p>
            )}
            {isConnected && (
              <Button size="sm" variant="secondary" className="w-fit" disabled={checking} onClick={() => void verify()}>
                {checking ? "Checking…" : "Check now"}
              </Button>
            )}
          </>
        )}
      </div>

      {busy && <PublishProgress active={checking ? 0 : uploading ? 1 : status === "pending" ? 3 : 2} />}

      {blocker && <Notice tone="warn">{blocker}</Notice>}
      {(error || localError) && <Notice tone="error">{localError ?? error}</Notice>}

      {isConnected ? (
        <Button size="lg" disabled={busy || Boolean(blocker) || !isContractConfigured} onClick={() => void onPublish()}>
          {label}
        </Button>
      ) : (
        <div className="grid gap-2">
          <p className="text-[13px] text-muted">
            Drafting and copying work without a wallet. Connect MetaMask to publish.
          </p>
          <div className="flex"><ConnectButton /></div>
        </div>
      )}

      {txHash && status === "pending" && (
        <p className="text-xs text-muted">
          Transaction sent:{" "}
          <Link href={txExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="font-mono underline">
            {txHash.slice(0, 10)}…
          </Link>
        </p>
      )}
    </section>
  );
}
