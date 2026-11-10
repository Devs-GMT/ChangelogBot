import type { Address } from "viem";
import { activeChain } from "@/web3/chains";

/**
 * Deployed ChangelogBot address — the one place it is configured.
 * Replace after the Remix deploy (or set NEXT_PUBLIC_CONTRACT_ADDRESS in Vercel).
 */
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const isContractConfigured = !/^0x0+$/.test(CONTRACT_ADDRESS);

const explorer = activeChain.blockExplorers.default.url;
export const CONTRACT_EXPLORER_URL = `${explorer}/address/${CONTRACT_ADDRESS}`;
export const txExplorerUrl = (hash: string) => `${explorer}/tx/${hash}`;
