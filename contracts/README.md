# ChangelogBot contract

`src/ChangelogBot.sol` — append-only registry of release notes. No tokens, no admin.

## Test locally

```bash
cd contracts
npm install
npm test        # 12 tests, solc 0.8.24, evmVersion paris
```

## Deploy with Remix

1. Open <https://remix.ethereum.org>, create `ChangelogBot.sol`, paste `src/ChangelogBot.sol`.
2. **Solidity compiler**: version `0.8.24`, *Advanced configurations* → EVM version `paris`, optimizer on (200 runs). Leave "Enable viaIR" off.
3. **Deploy & run**: environment `Injected Provider – MetaMask`, no constructor arguments.
4. Deploy on **testnet** first (chain ID 968, RPC `https://rpc.bohr.life`, explorer `https://scan.bohr.life`), call `publish` once with sample data, check `total()`.
5. Repeat on **mainnet** (chain ID 677, RPC `https://rpc.botchain.ai`, explorer `https://scan.botchain.ai`).
6. Put the address in `src/config/contract.ts` (`CONTRACT_ADDRESS`) and the root README.
