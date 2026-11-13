"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Button, buttonClass } from "@/components/ui/button";
import { shortAddress } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { activeChain } from "@/web3/chains";
import { useHasInjectedWallet, useMounted } from "./use-mounted";

const METAMASK_URL = "https://metamask.io/download/";

/**
 * `compact` is for the app header, where phones have no room to spare: shorter labels,
 * one wallet button at a time (the network switch replaces the address until fixed),
 * and notes float under the button instead of making the header taller.
 */
export function ConnectButton({ size = "md", compact = false }: { size?: "sm" | "md"; compact?: boolean }) {
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
      <a href={METAMASK_URL} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", size)}>
        {compact ? (
          <>
            <span className="sm:hidden">Get MetaMask</span>
            <span className="max-sm:hidden">Install MetaMask</span>
          </>
        ) : (
          "Install MetaMask"
        )}
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
            {switching ? (
              "Switching…"
            ) : compact ? (
              <>
                <span className="sm:hidden">Switch network</span>
                <span className="max-sm:hidden">Switch to {activeChain.name}</span>
              </>
            ) : (
              `Switch to ${activeChain.name}`
            )}
          </Button>
        )}
        <Button
          variant="secondary"
          size={size}
          onClick={() => disconnect()}
          title="Disconnect"
          className={cn("font-mono", compact && wrongNetwork && "max-sm:hidden")}
        >
          <span className="size-2 rounded-full bg-new" aria-hidden="true" />
          {shortAddress(address)}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", compact && "relative")}>
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
      {error && (
        <span
          role="alert"
          className={cn(
            "text-xs text-muted",
            compact && "absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg border border-line bg-paper px-2.5 py-1.5 shadow-card",
          )}
        >
          {error}
        </span>
      )}
    </div>
  );
}
