import { createPublicClient, http, type Address } from "viem";
import { CONTRACT_ADDRESS, isContractConfigured } from "@/config/contract";
import { activeChain } from "./chains";
import { changelogBotAbi } from "./abi";

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(),
});

export type OnChainRelease = {
  publisher: Address;
  repo: string;
  version: string;
  fromCommit: `0x${string}`;
  toCommit: `0x${string}`;
  notesHash: `0x${string}`;
  cid: string;
  verified: boolean;
  at: bigint;
};

const base = { address: CONTRACT_ADDRESS, abi: changelogBotAbi } as const;

/** Releases of a repo, oldest first. Empty when the contract is not configured. */
export async function getReleasesFor(repo: string): Promise<OnChainRelease[]> {
  if (!isContractConfigured) return [];
  const list = await publicClient.readContract({ ...base, functionName: "releasesFor", args: [repo] });
  return [...list];
}

export async function getTotals(): Promise<{ releases: number; repos: number } | null> {
  if (!isContractConfigured) return null;
  const [releases, repos] = await Promise.all([
    publicClient.readContract({ ...base, functionName: "total" }),
    publicClient.readContract({ ...base, functionName: "totalRepos" }),
  ]);
  return { releases: Number(releases), repos: Number(repos) };
}

/** Distinct repos of the most recent releases, newest first (for the "recorded for" strip). */
export async function getRecentRepos(limit = 8): Promise<string[]> {
  if (!isContractConfigured) return [];
  const total = Number(await publicClient.readContract({ ...base, functionName: "total" }));
  const ids = Array.from({ length: Math.min(total, 24) }, (_, i) => BigInt(total - 1 - i));
  const releases = await Promise.all(
    ids.map((id) => publicClient.readContract({ ...base, functionName: "getRelease", args: [id] })),
  );
  const seen = new Set<string>();
  const repos: string[] = [];
  for (const r of releases) {
    const key = r.repo.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    repos.push(r.repo);
    if (repos.length === limit) break;
  }
  return repos;
}
