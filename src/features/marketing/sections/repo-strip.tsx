import Link from "next/link";
import { CheckIcon, CubeIcon, GitHubIcon, LinkChainIcon, ShieldCheckIcon, TagIcon } from "@/components/ui/icons";
import { getCachedRecentRepos } from "@/server/chain/queries";
import { Frame } from "./section-shell";

async function recentRepos() {
  try {
    return await getCachedRecentRepos(6);
  } catch {
    return [];
  }
}

const RECORDED_FIELDS = [
  { icon: GitHubIcon, label: "Repo", value: "acme/widgets" },
  { icon: TagIcon, label: "Version", value: "v1.4.0" },
  { icon: LinkChainIcon, label: "Commit range", value: "a41f9c2…9be07d1" },
  { icon: CheckIcon, label: "Notes hash", value: "0x9c1f…a2e4" },
  { icon: CubeIcon, label: "IPFS CID", value: "bafybei…fbzdi" },
  { icon: ShieldCheckIcon, label: "Verified", value: ".changelogbot" },
];

const cell = "flex min-h-24 flex-col items-center justify-center gap-1.5 bg-paper px-3 py-5 text-center";

/** Real repos recorded on-chain when there are any; otherwise what every release records. Never invented names. */
export async function RepoStrip() {
  const repos = await recentRepos();

  return (
    <section aria-label="Recorded on BOT Chain" className="border-b border-line">
      <Frame>
        <p className="py-4 text-center text-[13px] text-muted">
          {repos.length > 0 ? "Changelogs recorded on BOT Chain for" : "Every release records, permanently"}
        </p>
        <ul className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {repos.length > 0
            ? repos.map((repo) => (
                <li key={repo} className="contents">
                  <Link href={`/c/${repo}`} className={`${cell} transition-colors hover:bg-canvas`}>
                    <GitHubIcon className="size-4 text-muted" />
                    <span className="max-w-full truncate font-mono text-[13px] font-medium">{repo}</span>
                  </Link>
                </li>
              ))
            : RECORDED_FIELDS.map(({ icon: Icon, label, value }) => (
                <li key={label} className={cell}>
                  <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                    <Icon className="size-4" /> {label}
                  </span>
                  <span className="font-mono text-[11px] text-muted">{value}</span>
                </li>
              ))}
        </ul>
      </Frame>
    </section>
  );
}
