import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";

const REVERT_MESSAGES: Record<string, string> = {
  VersionAlreadyPublished: "This version is already recorded by your wallet for this repo. Bump the version and try again.",
  VersionTooLong: "The version name is too long (max 20 characters).",
  EmptyVersion: "Add a version name before publishing.",
  EmptyRepo: "The repository name is missing.",
  RepoTooLong: "The repository name is too long.",
  EmptyCid: "The notes upload did not return an IPFS id. Please retry.",
  CidTooLong: "The IPFS id is unexpectedly long.",
};

/** Turns a wallet / contract error into a sentence a person can act on. */
export function describePublishError(error: unknown): string {
  if (error instanceof BaseError) {
    const rejected = error.walk((e) => e instanceof UserRejectedRequestError);
    if (rejected) return "You rejected the request in your wallet. Nothing was published.";

    const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;
      if (name && REVERT_MESSAGES[name]) return REVERT_MESSAGES[name];
    }
    // Some wallets only expose the error name in the message.
    for (const [name, message] of Object.entries(REVERT_MESSAGES)) {
      if (error.message.includes(name)) return message;
    }
    if (/insufficient funds/i.test(error.message)) return "Your wallet does not have enough BOT for gas.";
    return error.shortMessage || "The transaction failed. Please try again.";
  }
  return "The transaction failed. Please try again.";
}
