import { describe, expect, it } from "vitest";

import {
  AdminAuthorizationError,
  assertCmsMutationsAllowed,
  assertOwnerAuthorized,
  isAllowlistedOwner,
} from "./policy";

const owner = {
  userId: "9da83fc9-cec1-45f7-96be-4ed0c978b06f",
  email: "owner@example.com",
};

describe("owner authorization", () => {
  it("matches both immutable user id and normalized email", () => {
    expect(
      isAllowlistedOwner(
        { id: owner.userId, email: "OWNER@example.com" },
        owner,
      ),
    ).toBe(true);
  });

  it("rejects an account with only a matching email", () => {
    expect(
      isAllowlistedOwner(
        {
          id: "b8686d19-cf22-4ba5-9a8e-e76614f390b6",
          email: owner.email,
        },
        owner,
      ),
    ).toBe(false);
  });

  it("requires a matching database allowlist record", () => {
    expect(() =>
      assertOwnerAuthorized(
        { id: owner.userId, email: owner.email },
        null,
        owner,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<AdminAuthorizationError>>({
        code: "not-provisioned",
      }),
    );
  });

  it("returns a minimal identity for the provisioned owner", () => {
    expect(
      assertOwnerAuthorized(
        { id: owner.userId, email: "OWNER@example.com" },
        owner,
        owner,
      ),
    ).toEqual({ userId: owner.userId, email: owner.email });
  });
});

describe("CMS mutation policy", () => {
  it("keeps preview deployments read-only even when enabled", () => {
    expect(() =>
      assertCmsMutationsAllowed({
        mutationsEnabled: true,
        vercelEnvironment: "preview",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<AdminAuthorizationError>>({
        code: "preview-read-only",
      }),
    );
  });

  it("denies mutations when the explicit switch is off", () => {
    expect(() =>
      assertCmsMutationsAllowed({
        mutationsEnabled: false,
        vercelEnvironment: "production",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<AdminAuthorizationError>>({
        code: "mutations-disabled",
      }),
    );
  });

  it("allows explicitly enabled production mutations", () => {
    expect(() =>
      assertCmsMutationsAllowed({
        mutationsEnabled: true,
        vercelEnvironment: "production",
      }),
    ).not.toThrow();
  });
});
