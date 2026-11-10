"use client";

import { useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";

const subscribe = () => () => {};

/** The site origin in the browser (falls back to the configured URL on the server). */
export const useOrigin = () =>
  useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => siteConfig.url,
  );
