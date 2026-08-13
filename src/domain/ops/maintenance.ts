import { timingSafeEqual } from "node:crypto";

export function isCronAuthorized(
  authorizationHeader: string | null,
  secret: string | undefined,
) {
  if (!secret || secret.length < 32 || !authorizationHeader) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authorizationHeader);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function storageUsageState(bytes: number) {
  const limitBytes = 1_024 ** 3;
  const ratio = bytes / limitBytes;
  return {
    bytes,
    limitBytes,
    percentage: Math.min(100, ratio * 100),
    warning: ratio >= 0.8,
  };
}
