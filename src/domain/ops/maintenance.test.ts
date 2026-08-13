import { describe, expect, it } from "vitest";

import { isCronAuthorized, storageUsageState } from "./maintenance";

describe("maintenance safeguards", () => {
  const secret = "0123456789abcdef0123456789abcdef";

  it("accepts only the exact bearer secret", () => {
    expect(isCronAuthorized(`Bearer ${secret}`, secret)).toBe(true);
    expect(isCronAuthorized(`Bearer ${secret}x`, secret)).toBe(false);
    expect(isCronAuthorized(null, secret)).toBe(false);
  });

  it("rejects missing and weak cron secrets", () => {
    expect(isCronAuthorized("Bearer short", "short")).toBe(false);
    expect(isCronAuthorized("Bearer anything", undefined)).toBe(false);
  });

  it("warns after 80 percent of the free storage allowance", () => {
    expect(storageUsageState(800 * 1_024 ** 2).warning).toBe(false);
    expect(storageUsageState(820 * 1_024 ** 2).warning).toBe(true);
  });
});
