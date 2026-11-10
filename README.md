# ChangelogBot

Your commits, turned into release notes people enjoy reading. Pick two versions, let AI group what changed,
publish a changelog page — and record every release on **BOT Chain**.

- Paste a public GitHub repo → pick two tags (or dates) → AI-drafted notes → edit → publish
- Outputs: public changelog page (`/c/owner/repo`), GitHub Release Markdown, X post/thread, email summary
- Every release is recorded on-chain (repo, version, commit range, notes hash, IPFS CID)
- Verified maintainer: add a `.changelogbot` file containing your wallet address to your repo

**Contract (BOT Chain mainnet, chain ID 677):** `TBD — set after the Remix deploy` · explorer: https://scan.botchain.ai

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the keys below
npm run dev
```

| Variable | What it is |
| --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Free Gemini key from Google AI Studio |
| `PINATA_JWT` | Pinata JWT for IPFS uploads |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed `ChangelogBot` address |
| `NEXT_PUBLIC_NETWORK` | `testnet` while testing on chain 968, empty for mainnet |

Never commit `.env.local`. All keys stay on the server (API routes); nothing secret reaches the browser.

## Test

```bash
npm test                                  # unit tests: grouping, noise filter, semver, outputs, hashing
cd contracts && npm install && npm test   # smart-contract tests
```

## Deploy the contract (Remix)

See [`contracts/README.md`](contracts/README.md). Test on testnet (968) first, then mainnet (677).

## Deploy the site (Vercel)

Import the repo in Vercel, add the environment variables above, deploy. Set `NEXT_PUBLIC_SITE_URL` to your domain.

## Structure

```
contracts/         Solidity contract + tests (deployed via Remix)
src/app/           routing only: /, /app, /c/[owner]/[repo], /api/*
src/features/      marketing site, composer (the /app wizard), changelog page, wallet
src/components/ui  shared UI pieces
src/lib/           pure logic: GitHub client, Conventional Commits, noise filter, semver, outputs
src/server/        server-only code: AI, IPFS, rate limiting, chain reads
src/web3/          chains, ABI, wagmi config, contract reads
src/config/        site + contract configuration
```

AI-drafted notes — always review before publishing.
