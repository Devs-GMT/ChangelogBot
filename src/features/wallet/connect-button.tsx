"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/utils/format";
import { activeChain } from "@/web3/chains";
import { useHasInjectedWallet, useMounted } from "./use-mounted";

const METAMASK_URL = "https://metamask.io/download/";

export function ConnectButton({ size = "md" }: { size?: "sm" | "md" }) {
  const mounted = useMounted();
  const hasWallet = useHasInjectedWallet();
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);

  if (!mounted) return <Button variant="secondary" size={size} disabled>Connect wallet</Button>;

  if (!hasWallet && !isConnected) {
    return (
      <a
        href={METAMASK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center rounded-btn border border-line px-4 text-sm font-medium transition-colors hover:bg-canvas hover:text-ink"
      >
        Install MetaMask
      </a>
    );
  }

  if (isConnected && address) {
    const wrongNetwork = chainId !== activeChain.id;
    return (
      <div className="flex items-center gap-2">
        {wrongNetwork && (
          <Button
            variant="secondary"
            size={size}
            disabled={switching}
            onClick={() => switchChain({ chainId: activeChain.id })}
            className="border-fixed/40 text-fixed"
          >
            {switching ? "Switching…" : `Switch to ${activeChain.name}`}
          </Button>
        )}
        <Button
          variant="secondary"
          size={size}
          onClick={() => disconnect()}
          title="Disconnect"
          className="font-mono"
        >
          <span className="size-2 rounded-full bg-new" aria-hidden="true" />
          {shortAddress(address)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        size={size}
        disabled={isPending}
        onClick={() => {
          setError(null);
          connect(
            { connector: connectors[0], chainId: activeChain.id },
            { onError: () => setError("Connection cancelled.") },
          );
        }}
      >
        {isPending ? "Connecting…" : "Connect wallet"}
      </Button>
      {error && <span role="alert" className="text-xs text-muted">{error}</span>}
    </div>
  );
}
