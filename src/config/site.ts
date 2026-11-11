/** Empty or scheme-less values (a blank line copied from .env.example) fall back instead of crashing `new URL`. */
function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "https://changelogbot.vercel.app";
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return URL.canParse(url) ? url.replace(/\/+$/, "") : "https://changelogbot.vercel.app";
}

export const siteConfig = {
  name: "ChangelogBot",
  tagline: "Release notes, built for the AI era.",
  description:
    "Pick two versions. ChangelogBot reads your commits, writes release notes people enjoy, and records every release on BOT Chain.",
  url: siteUrl(),
  links: {
    botChain: "https://botchain.ai",
    botChainDocs: "https://docs.botchain.ai",
    conventionalCommits: "https://www.conventionalcommits.org",
    github: "https://github.com/",
    x: "https://x.com/",
  },
  /** Shown on the landing page. Replace with your own words — only real quotes belong here. */
  maker: {
    quote:
      "I wanted release notes that people actually read, and a record nobody can quietly rewrite. ChangelogBot does both.",
    name: "The maker of ChangelogBot",
  },
  nav: [
    { label: "Product", href: "/#product" },
    { label: "Examples", href: "/#examples" },
    { label: "Docs", href: "/#how-it-works" },
  ],
} as const;
