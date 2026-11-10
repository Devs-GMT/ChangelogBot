"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False on the server and during hydration, true afterwards — avoids wallet-state hydration mismatches. */
export const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

/** True when an injected wallet (MetaMask) exists in this browser. */
export const useHasInjectedWallet = () =>
  useSyncExternalStore(
    subscribe,
    () => typeof window !== "undefined" && Boolean((window as { ethereum?: unknown }).ethereum),
    () => false,
  );
