import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "resume-optimizer-admin";
const ADMIN_MARKER = "admin-unlocked";

function getSecret(): string {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  if (!secret) {
    throw new Error("COOKIE_SIGNING_SECRET environment variable is not set.");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminCookieValue(): string {
  return sign(ADMIN_MARKER);
}

export function isValidAdminCookieValue(cookieValue: string): boolean {
  const expected = sign(ADMIN_MARKER);
  const actualBuffer = Buffer.from(cookieValue);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}
