import { createConfig, http, injected } from "wagmi";
import { botMainnet, botTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [botMainnet, botTestnet],
  connectors: [injected({ target: "metaMask" })],
  transports: {
    [botMainnet.id]: http(),
    [botTestnet.id]: http(),
  },
  ssr: true,
});
