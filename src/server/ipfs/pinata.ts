import "server-only";
import { PinataSDK } from "pinata";

export const ipfsConfigured = () => Boolean(process.env.PINATA_JWT);

/** Uploads the exact bytes of `json` (so the on-chain hash matches the stored file). Returns the CID. */
export async function uploadJson(json: string, name: string): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("IPFS is not configured.");
  const pinata = new PinataSDK({ pinataJwt: jwt, pinataGateway: process.env.PINATA_GATEWAY });
  const file = new File([json], `${name}.json`, { type: "application/json" });
  const res = await pinata.upload.public.file(file);
  return res.cid;
}
