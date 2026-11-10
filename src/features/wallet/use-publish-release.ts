"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import type { Hex } from "viem";
import { CONTRACT_ADDRESS, isContractConfigured } from "@/config/contract";
import { activeChain } from "@/web3/chains";
import { changelogBotAbi } from "@/web3/abi";
import { describePublishError } from "@/web3/errors";

export type PublishStatus = "idle" | "switching" | "signing" | "pending" | "success" | "error";

export interface PublishArgs {
  repo: string;
  version: string;
  fromCommit: Hex;
  toCommit: Hex;
  notesHash: Hex;
  cid: string;
  verified: boolean;
}

export function usePublishRelease() {
  const { chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const client = usePublicClient({ chainId: activeChain.id });

  const [status, setStatus] = useState<PublishStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxHash(null);
  }, []);

  const publish = useCallback(
    async (args: PublishArgs) => {
      setError(null);
      setTxHash(null);
      try {
        if (!isContractConfigured) throw new Error("The contract address is not configured yet.");
        if (!isConnected) throw new Error("Connect your wallet first.");

        if (chainId !== activeChain.id) {
          setStatus("switching");
          await switchChainAsync({ chainId: activeChain.id });
        }

        setStatus("signing");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: changelogBotAbi,
          functionName: "publish",
          chainId: activeChain.id,
          args: [args.repo, args.version, args.fromCommit, args.toCommit, args.notesHash, args.cid, args.verified],
        });
        setTxHash(hash);

        setStatus("pending");
        const receipt = await client?.waitForTransactionReceipt({ hash });
        if (receipt && receipt.status !== "success") throw new Error("The transaction was reverted on-chain.");

        setStatus("success");
        return hash;
      } catch (e) {
        setError(e instanceof Error && !("shortMessage" in e) ? e.message : describePublishError(e));
        setStatus("error");
        return null;
      }
    },
    [chainId, client, isConnected, switchChainAsync, writeContractAsync],
  );

  return { publish, reset, status, error, txHash };
}
