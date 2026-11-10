import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keccak256, toBytes, zeroAddress, type Hex } from "viem";
import { network } from "hardhat";

const FROM = "0x1111111111111111111111111111111111111111" as const;
const TO = "0x2222222222222222222222222222222222222222" as const;
const HASH = keccak256(toBytes("notes")) as Hex;
const CID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

describe("ChangelogBot", async () => {
  const { viem } = await network.connect();
  const [alice, bob] = await viem.getWalletClients();

  async function deploy() {
    const bot = await viem.deployContract("ChangelogBot");
    return bot;
  }

  const args = (over: Partial<{ repo: string; version: string; cid: string; verified: boolean }> = {}) =>
    [
      over.repo ?? "owner/repo",
      over.version ?? "v1.0.0",
      FROM,
      TO,
      HASH,
      over.cid ?? CID,
      over.verified ?? false,
    ] as const;

  it("publishes a release, stores it and emits Published", async () => {
    const bot = await deploy();
    await viem.assertions.emitWithArgs(
      bot.write.publish(args({ verified: true }), { account: alice.account }),
      bot,
      "Published",
      [0n, "owner/repo", "v1.0.0", alice.account.address, true],
    );
    assert.equal(await bot.read.total(), 1n);
    const r = await bot.read.getRelease([0n]);
    assert.equal(r.publisher.toLowerCase(), alice.account.address.toLowerCase());
    assert.equal(r.repo, "owner/repo");
    assert.equal(r.version, "v1.0.0");
    assert.equal(r.fromCommit, FROM);
    assert.equal(r.toCommit, TO);
    assert.equal(r.notesHash, HASH);
    assert.equal(r.cid, CID);
    assert.equal(r.verified, true);
    assert.ok(r.at > 0n);
  });

  it("rejects the same version twice from the same publisher (any repo casing)", async () => {
    const bot = await deploy();
    await bot.write.publish(args(), { account: alice.account });
    await viem.assertions.revertWithCustomError(
      bot.write.publish(args({ repo: "Owner/Repo" }), { account: alice.account }),
      bot,
      "VersionAlreadyPublished",
    );
  });

  it("lets a different publisher use the same version", async () => {
    const bot = await deploy();
    await bot.write.publish(args(), { account: alice.account });
    await bot.write.publish(args(), { account: bob.account });
    assert.equal(await bot.read.total(), 2n);
  });

  it("lets the same publisher publish different versions and repos", async () => {
    const bot = await deploy();
    await bot.write.publish(args({ version: "v1.0.0" }), { account: alice.account });
    await bot.write.publish(args({ version: "v1.1.0" }), { account: alice.account });
    await bot.write.publish(args({ repo: "owner/other", version: "v1.0.0" }), { account: alice.account });
    assert.equal(await bot.read.total(), 3n);
  });

  it("accepts a 20-byte version and rejects 21 bytes", async () => {
    const bot = await deploy();
    await bot.write.publish(args({ version: "v".repeat(20) }), { account: alice.account });
    await viem.assertions.revertWithCustomError(
      bot.write.publish(args({ version: "v".repeat(21) }), { account: alice.account }),
      bot,
      "VersionTooLong",
    );
  });

  it("rejects empty repo, version and cid", async () => {
    const bot = await deploy();
    await viem.assertions.revertWithCustomError(bot.write.publish(args({ repo: "" })), bot, "EmptyRepo");
    await viem.assertions.revertWithCustomError(bot.write.publish(args({ version: "" })), bot, "EmptyVersion");
    await viem.assertions.revertWithCustomError(bot.write.publish(args({ cid: "" })), bot, "EmptyCid");
  });

  it("rejects over-long repo and cid", async () => {
    const bot = await deploy();
    await viem.assertions.revertWithCustomError(
      bot.write.publish(args({ repo: "a".repeat(141) })),
      bot,
      "RepoTooLong",
    );
    await viem.assertions.revertWithCustomError(
      bot.write.publish(args({ cid: "b".repeat(101) })),
      bot,
      "CidTooLong",
    );
  });

  it("looks repos up case-insensitively and returns oldest first", async () => {
    const bot = await deploy();
    await bot.write.publish(args({ repo: "Owner/Repo", version: "v1.0.0" }), { account: alice.account });
    await bot.write.publish(args({ repo: "owner/REPO", version: "v1.1.0" }), { account: bob.account });
    await bot.write.publish(args({ repo: "owner/other", version: "v9.9.9" }), { account: alice.account });

    const list = await bot.read.releasesFor(["OWNER/repo"]);
    assert.deepEqual(list.map((r) => r.version), ["v1.0.0", "v1.1.0"]);
    const latest = await bot.read.latestFor(["owner/repo"]);
    assert.equal(latest.version, "v1.1.0");
    assert.equal(await bot.read.repoKey(["Owner/Repo"]), await bot.read.repoKey(["owner/repo"]));
  });

  it("latestFor reverts and releasesFor is empty for unknown repos", async () => {
    const bot = await deploy();
    await viem.assertions.revertWithCustomError(bot.read.latestFor(["nobody/nothing"]), bot, "NoReleasesForRepo");
    assert.deepEqual(await bot.read.releasesFor(["nobody/nothing"]), []);
  });

  it("getRelease reverts for an unknown id", async () => {
    const bot = await deploy();
    await viem.assertions.revertWithCustomError(bot.read.getRelease([0n]), bot, "ReleaseNotFound");
  });

  it("releasesBy lists only that publisher's releases", async () => {
    const bot = await deploy();
    await bot.write.publish(args({ version: "v1.0.0" }), { account: alice.account });
    await bot.write.publish(args({ version: "v1.1.0" }), { account: bob.account });
    await bot.write.publish(args({ version: "v1.2.0" }), { account: alice.account });
    const mine = await bot.read.releasesBy([alice.account.address]);
    assert.deepEqual(mine.map((r) => r.version), ["v1.0.0", "v1.2.0"]);
    assert.deepEqual(await bot.read.releasesBy([zeroAddress]), []);
  });

  it("counts distinct repos once, regardless of casing", async () => {
    const bot = await deploy();
    await bot.write.publish(args({ repo: "a/b", version: "v1" }), { account: alice.account });
    await bot.write.publish(args({ repo: "A/B", version: "v2" }), { account: alice.account });
    await bot.write.publish(args({ repo: "c/d", version: "v1" }), { account: alice.account });
    assert.equal(await bot.read.totalRepos(), 2n);
    assert.equal(await bot.read.total(), 3n);
  });
});
