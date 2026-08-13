export interface AuthenticatedUser {
  id: string;
  email?: string | null;
}

export interface AdminRecord {
  userId: string;
  email: string;
}

export interface OwnerAllowlist {
  userId: string;
  email: string;
}

export type AdminAuthorizationCode =
  | "unauthenticated"
  | "not-owner"
  | "not-provisioned"
  | "mutations-disabled"
  | "preview-read-only";

export class AdminAuthorizationError extends Error {
  constructor(public readonly code: AdminAuthorizationCode) {
    super(code);
    this.name = "AdminAuthorizationError";
  }
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isAllowlistedOwner(
  user: AuthenticatedUser,
  allowlist: OwnerAllowlist,
) {
  return (
    user.id === allowlist.userId &&
    normalizeEmail(user.email) === normalizeEmail(allowlist.email)
  );
}

export function assertOwnerAuthorized(
  user: AuthenticatedUser | null,
  adminRecord: AdminRecord | null,
  allowlist: OwnerAllowlist,
) {
  if (!user) throw new AdminAuthorizationError("unauthenticated");
  if (!isAllowlistedOwner(user, allowlist)) {
    throw new AdminAuthorizationError("not-owner");
  }
  if (
    !adminRecord ||
    adminRecord.userId !== user.id ||
    normalizeEmail(adminRecord.email) !== normalizeEmail(allowlist.email)
  ) {
    throw new AdminAuthorizationError("not-provisioned");
  }

  return {
    userId: user.id,
    email: normalizeEmail(user.email),
  };
}

export function assertCmsMutationsAllowed(runtime: {
  mutationsEnabled: boolean;
  vercelEnvironment?: string;
}) {
  if (runtime.vercelEnvironment === "preview") {
    throw new AdminAuthorizationError("preview-read-only");
  }
  if (!runtime.mutationsEnabled) {
    throw new AdminAuthorizationError("mutations-disabled");
  }
}
