import crypto from "crypto";

export const SUBSCRIPTION_COOKIE_NAME = "resume-optimizer-subscription";

interface SubscriptionCookiePayload {
  customerId: string;
  subscriptionId: string;
}

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

export function createSubscriptionCookieValue(payload: SubscriptionCookiePayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function parseSubscriptionCookieValue(cookieValue: string): SubscriptionCookiePayload | null {
  const [encoded, signature] = cookieValue.split(".");
  if (!encoded || !signature) return null;

  const expectedSignature = sign(encoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf-8");
    const payload = JSON.parse(decoded);
    if (typeof payload.customerId !== "string" || typeof payload.subscriptionId !== "string") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
