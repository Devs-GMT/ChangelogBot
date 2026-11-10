ChangelogBot — PRD (MVP)

One-liner: Your commits, turned into release notes people enjoy reading. Pick two versions, let AI group what changed, publish a beautiful changelog — and record every release on BOT Chain.

Category: AI · Productivity · Feasibility: 🟢 Easy · Target build time: ~4.5 hours · Build Week: 4

1. Must-haves (definition of done)

[ ] MetaMask wallet connect — Connect button, short address shown, auto-switch/add BOT Chain mainnet (chain ID 677)
[ ] 1 core feature works — Paste repo → pick two tags → AI release notes → edit → [Publish release] tx succeeds → public changelog page shows the release with "Recorded on BOT Chain"
[ ] Outputs: changelog page, GitHub Release Markdown, X post
[ ] Verified maintainer check via .changelogbot file
[ ] Website first, then app (/ → /app), desktop-first, responsive, GSAP animations
[ ] Home page with 5+ sections — 7 sections, see section 10
[ ] Mainnet deployment — Contract on BOT Chain mainnet, address in README + footer, visible on scan.botchain.ai
[ ] Live website — Public URL (GitHub Pages + custom domain) + live Worker
[ ] BOT Chain footer — Clickable BOT Chain logo → botchain.ai + View on explorer → mainnet contract (section 13)

2. User flow (the app)

Step 1 · Repo — github.com/owner/repo → loads tags, releases and the default branch
Step 2 · Range — From (tag / date) → To (tag / "latest commit" / date); new version name (suggested: next semver, e.g. v1.3.0 → v1.4.0 if there are features, v1.3.1 if only fixes)
Step 3 · Reading changes — animated: "42 commits · 7 pull requests · 3 contributors" + noise filter (merge commits, chore:, ci:, dependency bumps, bots — toggle to include)
Step 4 · Draft — AI groups changes into ✨ New · 🛠 Improved · 🐛 Fixed · ⚠️ Breaking, each item written for users ("You can now switch to BOT Chain testnet with one click") with links to its commits/PRs, plus a 2-line summary and 3 highlights; Conventional Commit prefixes (feat:, fix:) are used first, AI only for the rest
Step 5 · Edit — drag items between groups, edit text, hide internal items, add an image/GIF URL to a highlight, choose tone (Friendly · Professional · Playful)
Step 6 · Outputs (tabs):
Changelog page preview (/c/owner/repo) — version timeline, newest first
GitHub Release Markdown — [Copy] + [Open new release on GitHub] (opens github.com/owner/repo/releases/new?tag=v1.4.0 to paste)
X post (≤ 280) + short thread option — [Copy] / [Open in X]
Email summary (plain text for a newsletter)
Step 7 · Publish — notes JSON uploaded to IPFS (Worker) → [Publish release] (tx) records repo, version, date, commit range, notes hash + CID → the public changelog page shows "✓ Recorded on BOT Chain" per release + explorer link
Verified maintainer — the app shows: "Add a file .changelogbot to your repo containing 0xYourWallet to get ✓ Verified"; it checks the raw file before publishing and stores the result

3. Core logic

GitHub API (public, browser): /repos/{o}/{r}, /tags, /releases, /compare/{base}...{head} (≤ 250 commits; longer ranges → ask to split), commit messages, authors, Merge pull request #N from … titles + PR numbers
Grouping: Conventional Commits first (feat → New, fix → Fixed, perf/refactor → Improved, !/BREAKING → Breaking); AI (Worker /changelog/draft) groups the rest and rewrites titles for users; rule: only describe changes present in the commit/PR text; never invent features
Semver suggestion: breaking → major, any New → minor, only fixes → patch
Verification: fetch raw.githubusercontent.com/{o}/{r}/{branch}/.changelogbot; if it contains the connected wallet → verified = true (stored on-chain by the app; label shows the check method)
Caching: repo reads cached in the browser; GitHub limit 60 requests/hour per visitor shown

4. Worker (shared Cloudflare Worker)

POST /changelog/draft (commits → grouped notes + summary + highlights) · POST /changelog/post (notes → X post/thread) · POST /upload (IPFS)
Key secret, CORS locked, rate limit, no logging

5. Smart contract (Solidity ^0.8.20)

struct Release { address publisher; string repo; string version; bytes20 fromCommit; bytes20 toCommit; bytes32 notesHash; string cid; bool verified; uint64 at; }
Release[] public releases; mapping(bytes32 => uint256[]) releasesOfRepo; mapping(bytes32 => mapping(bytes32 => bool)) versionUsed; (repoKey = keccak256(lowercase repo))
publish(string repo, string version, bytes20 fromCommit, bytes20 toCommit, bytes32 notesHash, string cid, bool verified) returns (uint256 id) — version ≤ 20 chars; a version can't be published twice for the same repo by the same publisher
Views: getRelease(id), releasesFor(repo), latestFor(repo), releasesBy(addr), total()
event Published(uint256 indexed id, string repo, string version, address indexed publisher, bool verified)
The public page shows verified releases first; unverified ones are labelled "Published by 0xAB… (not verified)"
No tokens or payments; evmVersion paris unless the BOT Chain docs confirm newer opcodes

6. Tech stack

Single-page site: / website + /app, /c/:owner/:repo (+ 404 redirect on GitHub Pages)
ethers.js v6 · marked + DOMPurify · SortableJS · Chart.js (commits per week sparkline) · GSAP 3.13+ (ScrollTrigger, SplitText, Flip)
Worker: shared Cloudflare Worker; Contract: Remix → testnet (chain ID 968, RPC https://rpc.bohr.life, scan.bohr.life) → mainnet (chain ID 677, RPC https://rpc.botchain.ai, scan.botchain.ai)

7. App layout & responsive

Desktop: left: repo header (name, stars, language, verified badge) + range pickers + change stats; centre: grouped release notes editor (drag between group columns); right: output tabs preview
Changelog page: clean timeline — version + date on the left rail, notes on the right, "✓ Recorded on BOT Chain" chip per release, RSS-style "Subscribe" link (Atom feed generated in the browser is optional)
Mobile: steps one by one; groups as collapsible sections; outputs as a bottom sheet

8. UI direction (Mora-style clean analytics site, ChangelogBot's own palette)

From Mora (built in Framer): a crisp, modern SaaS page — hero with a short demo GIF + "Watch demo" link and tabs of product screenshots, a logo strip, a 3-card feature row (connect → ask → visualize) with a testimonial, an "Ask anything" section with three columns of example prompts and chat-style + code-file demo panels (top_enterprise_arr.sql style file boxes), a dashboard mockup with stat tiles, a platform section of small feature cards (chart settings, white-label, Slack-style alert, connection status, API card, performance stats), security badges, a numbered 01–03 onboarding row, a repeated final CTA, and a footer with an "Ask about Mora on…" row of AI assistants
Our colours (the page didn't expose colours): white #FFFFFF · soft grey page #F7F8FA · hairlines #E7E9EE · ink #111318 · muted #646B78 · accent violet #6E56CF (primary buttons, links) · group colours: ✨ New #16A34A · 🛠 Improved #2563EB · 🐛 Fixed #EA580C · ⚠️ Breaking #DC2626 (soft tinted chips)
Type: headlines "Inter Display" 600 (or "Geist"), body "Inter", commit hashes, versions and file boxes in "Geist Mono"
Buttons: rounded rectangles (10px) — violet filled (primary), white with hairline (secondary)
File boxes: like Mora's SQL boxes — a small header with a file name (CHANGELOG.md, release-v1.4.0.md) and mono content
Your own logo (a small tag + sparkle) — not Mora's brand

9. Animations (GSAP)

Hero demo: commit messages scroll in as a raw list → they sort themselves into New / Improved / Fixed columns (Flip) → messy titles rewrite into friendly sentences (TextPlugin) → a "v1.4.0 · Recorded on BOT Chain ✓" chip pops
Hero tabs: "Draft · Changelog page · GitHub Release" switch screenshots with a crossfade (like Mora's tabs)
Example prompts columns: three columns of example commit messages scroll slowly upward at different speeds (infinite marquee)
Feature cards: stat tiles count up (commits, PRs, contributors); sparkline draws in
01–03 row: numbers flip in as you scroll
Transform/opacity only; respect prefers-reduced-motion

10. Website (7 sections, following the Mora layout)

Navbar: logo · Product · Examples · Docs · "Connect wallet" + violet [Write my changelog]
Section 1 · Hero — headline "Release notes, / built for the AI era.", sub "Pick two versions. ChangelogBot reads your commits, writes notes people enjoy, and records every release on BOT Chain.", [Write my changelog] + "Watch demo (1m)"; the animated demo + tabs Draft · Changelog page · GitHub Release
Section 2 · Repo strip — "Changelogs recorded for" + real published repo names
Section 3 · "ChangelogBot connects your repo" — 3 cards: Connect your repo (tags, releases, PRs — "Auto" badges) · Group what changed · Publish everywhere (page, GitHub, X) + a quote from you as the maker (real, not invented customers)
Section 4 · "Write less, ship more" (like "Ask anything") — three scrolling columns of real-looking commit messages + demo panels: a chat-style "What changed since v1.3?" answer, a release-v1.4.0.md file box, a changelog timeline mockup with stat tiles (42 commits · 7 PRs · 3 contributors)
Section 5 · "Built for teams that ship seriously" (platform cards) — Conventional Commits · Noise filter · Semver suggestion · Verified maintainer · X post + email summary · On-chain history ("Recorded on BOT Chain — can't be edited later")
Section 6 · "Set up in 3 steps" (like the onboarding row) — 01 Paste your repo · 02 Add .changelogbot (get verified) · 03 Publish your first release
Section 7 · Final CTA — "Ship it. Tell everyone. Keep the record." + [Write my changelog]
Then the footer (section 13)

11. States to handle

Repo not found / private → message; no tags → use date range or first commit
More than 250 commits in range → "Split the range" suggestion
GitHub rate limit → wait message; cached repo still works
All commits are noise → "Only maintenance changes — include them?"
AI error → notes from Conventional Commits only + raw list
.changelogbot missing / wrong wallet → publish as unverified with explanation
Same version already published by you → "v1.4.0 already recorded — bump the version"
No MetaMask → drafting + copying works; publishing asks to install; wrong network → "Switch to BOT Chain"
Tx pending / rejected / failed → message + retry; IPFS upload failed → retry

12. Out of scope (MVP)

Private repos, GitHub login, automatic GitHub Release creation, scheduled releases, multiple branches, monorepo packages, email sending, accounts, backend database.

13. Footer (required — creative version)

Concept: the footer is ChangelogBot's own latest release note — a file box called CHANGELOG.md — plus Mora's "Ask about us on…" row turned into "Recorded on".

White footer with a Mora-style file box CHANGELOG.md:

## v1.0.0 — recorded on BOT Chain

"✨ New: every release lives on-chain" · "🛠 Improved: notes people actually read"
the BOT Chain logo + "chain ID 677" — clickable → https://botchain.ai (new tab)
mono 0x12ab…9f3c (copy) + violet button [View on explorer ↗] → https://scan.botchain.ai/address/<MAINNET_CONTRACT_ADDRESS> (new tab) + live "RELEASES 132 · REPOS 41"
Row (like "Ask about Mora on"): "Recorded on" + BOT Chain logo chip · "Read by" GitHub · X chips
Link columns: Product (Write a changelog · Examples · Changelog pages) · Resources (Docs · Conventional Commits guide · BOT Chain docs) · Company (GitHub · X · Privacy · Terms)
Bottom: "© 2026 ChangelogBot · AI-drafted notes — always review before publishing"
Contract address in one config constant; on mobile the file box is full-width above stacked columns

14. Build plan (~4.5h)

0:00–0:30 — Contract (publish, history) in Remix; test on testnet
0:30–1:15 — GitHub reading (tags, releases, compare) + noise filter + Conventional Commits grouping + semver suggestion
1:15–1:45 — Worker /changelog/draft, /changelog/post, /upload
1:45–3:00 — App: range picker, draft editor (drag between groups), outputs (page, GitHub Markdown, X post, email), verification check, publish, public changelog page
3:00–4:00 — Website: 7 sections with sorting-commits hero, commit-message columns, file boxes, CHANGELOG footer
4:00–4:15 — Responsive + reduced motion
4:15–4:30 — Mainnet deploy, address constant, GitHub Pages + domain; publish changelogs for 2 of your own repos (with .changelogbot); README, demo clip, X post tagging @BOTChain_ai

15. Submission checklist

[ ] Mainnet contract address + a public changelog page link
[ ] Live website link
[ ] GitHub repo with ChangelogBot.sol + .changelogbot + plain-English README (no API key committed!)
[ ] X post with demo clip, tagging @BOTChain_ai
