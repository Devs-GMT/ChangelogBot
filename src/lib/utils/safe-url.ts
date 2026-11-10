/** Returns the URL when it is a valid http(s) link, otherwise null. Notes from IPFS are untrusted. */
export function safeHttpUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) && URL.canParse(url) ? url : null;
}
