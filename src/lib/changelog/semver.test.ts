import { describe, expect, it } from "vitest";
import { suggestNextVersion } from "./semver";

describe("suggestNextVersion", () => {
  it("bumps major on breaking", () => expect(suggestNextVersion("v1.3.2", ["new", "breaking"])).toBe("v2.0.0"));
  it("bumps minor when there are new features", () =>
    expect(suggestNextVersion("v1.3.2", ["new", "fixed"])).toBe("v1.4.0"));
  it("bumps patch for fixes only", () => expect(suggestNextVersion("v1.3.2", ["fixed"])).toBe("v1.3.3"));
  it("keeps a missing v prefix", () => expect(suggestNextVersion("1.0.0", ["improved"])).toBe("1.0.1"));
  it("ignores prerelease suffixes", () => expect(suggestNextVersion("v2.0.0-beta.1", ["new"])).toBe("v2.1.0"));
  it("falls back to v1.0.0 without a parsable tag", () => {
    expect(suggestNextVersion(undefined, ["new"])).toBe("v1.0.0");
    expect(suggestNextVersion("nightly", ["new"])).toBe("v1.0.0");
  });
});
