import { defineChain } from "viem";

export const botMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.botchain.ai"] } },
  blockExplorers: { default: { name: "BOT Scan", url: "https://scan.botchain.ai" } },
});

export const botTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.bohr.life"] } },
  blockExplorers: { default: { name: "Bohr Scan", url: "https://scan.bohr.life" } },
  testnet: true,
});

/** Switch to the testnet for development with NEXT_PUBLIC_NETWORK=testnet. */
export const activeChain =
  process.env.NEXT_PUBLIC_NETWORK === "testnet" ? botTestnet : botMainnet;
