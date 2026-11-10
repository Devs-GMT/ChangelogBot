export const shortAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export const formatDate = (unixSeconds: number | bigint) =>
  new Date(Number(unixSeconds) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
