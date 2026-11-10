import { BotChainLogo } from "@/components/ui/botchain-logo";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowUpRightIcon, GitHubIcon, SparkleIcon, TrendIcon, XLogoIcon } from "@/components/ui/icons";
import { FileBox } from "@/components/ui/file-box";
import { Logo } from "@/components/ui/logo";
import { CONTRACT_ADDRESS, CONTRACT_EXPLORER_URL, isContractConfigured } from "@/config/contract";
import { siteConfig } from "@/config/site";
import { shortAddress } from "@/lib/utils/format";
import { activeChain } from "@/web3/chains";
import { getCachedTotals } from "@/server/chain/queries";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Write a changelog", href: "/app" },
      { label: "Examples", href: "/#examples" },
      { label: "Changelog pages", href: "/#product" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/#how-it-works" },
      { label: "Conventional Commits guide", href: siteConfig.links.conventionalCommits, external: true },
      { label: "BOT Chain docs", href: siteConfig.links.botChainDocs, external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "GitHub", href: siteConfig.links.github, external: true },
      { label: "X", href: siteConfig.links.x, external: true },
    ],
  },
];

async function safeTotals() {
  try {
    return await getCachedTotals();
  } catch {
    return null;
  }
}

export async function Footer() {
  const totals = await safeTotals();

  return (
    <footer className="bg-paper">
      <div className="mx-auto grid w-full max-w-7xl gap-12 border-line px-5 py-16 sm:border-x sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <FileBox name="CHANGELOG.md" bodyClassName="grid gap-4 text-[13px]">
          <p className="font-semibold">## v1.0.0 — recorded on BOT Chain</p>
          <ul className="grid gap-1 text-muted">
            <li className="flex items-center gap-2">
              <SparkleIcon className="size-3.5 text-new" />
              <span className="text-new">New:</span> every release lives on-chain
            </li>
            <li className="flex items-center gap-2">
              <TrendIcon className="size-3.5 text-improved" />
              <span className="text-improved">Improved:</span> notes people actually read
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
            <a
              href={siteConfig.links.botChain}
              {...ext}
              aria-label="BOT Chain (opens botchain.ai)"
              className="inline-flex items-center gap-2 rounded-md text-ink hover:text-violet"
            >
              <BotChainLogo />
              <span className="text-xs text-muted">chain ID {activeChain.id}</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-canvas px-2 py-1 text-xs">
              {isContractConfigured ? shortAddress(CONTRACT_ADDRESS) : "contract not deployed yet"}
            </code>
            {isContractConfigured && (
              <>
                <CopyButton text={CONTRACT_ADDRESS} />
                <ButtonLink external size="sm" href={CONTRACT_EXPLORER_URL}>
                  View on explorer <ArrowUpRightIcon className="size-3.5" />
                </ButtonLink>
              </>
            )}
          </div>
          {totals && (
            <p className="text-xs tracking-wide text-muted">
              RELEASES <span className="text-ink">{totals.releases}</span> · REPOS{" "}
              <span className="text-ink">{totals.repos}</span>
            </p>
          )}
        </FileBox>

        <div className="grid content-start gap-10">
          <div className="grid gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted">Recorded on</span>
              <a href={siteConfig.links.botChain} {...ext} className="rounded-full">
                <Chip className="gap-2 py-1 text-ink hover:bg-line/50">
                  <BotChainLogo className="text-xs" />
                </Chip>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted">Read by</span>
              <a href={siteConfig.links.github} {...ext} className="rounded-full">
                <Chip className="py-1 text-ink hover:bg-line/50"><GitHubIcon className="size-3.5" /> GitHub</Chip>
              </a>
              <a href={siteConfig.links.x} {...ext} className="rounded-full">
                <Chip className="py-1 text-ink hover:bg-line/50"><XLogoIcon className="size-3" /> X</Chip>
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-sans text-[13px] font-semibold tracking-normal">{col.title}</h2>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} {...(l.external ? ext : {})} className="rounded transition-colors hover:text-ink">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Oversized wordmark, cut off by the bottom bar */}
      <div aria-hidden="true" className="pointer-events-none mx-auto w-full max-w-7xl select-none overflow-hidden border-line px-4 sm:border-x">
        <p className="translate-y-[18%] text-center font-display text-[clamp(3rem,11vw,9.5rem)] font-semibold leading-[0.8] tracking-[-0.06em] text-canvas [-webkit-text-stroke:1px_var(--color-line)]">
          ChangelogBot
        </p>
      </div>

      <div className="relative border-t border-line bg-paper">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-line px-5 py-5 sm:border-x sm:px-10 text-xs text-muted">
          <Logo className="text-sm" />
          <p>© 2026 ChangelogBot · AI-drafted notes — always review before publishing</p>
        </div>
      </div>
    </footer>
  );
}
