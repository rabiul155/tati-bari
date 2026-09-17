// Signed (not encrypted) admin session token: "<payload>.<signature>",
// both base64url, signed with HMAC-SHA256. The payload holds only the admin
// id, session version and expiry.
//
// This module has no `server-only` or `next/headers` imports so that
// proxy.ts can use it too. It still depends on node:crypto, so it can never
// be bundled for the browser.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = {
  // AdminUser.id
  sub: string;
  // AdminUser.sessionVersion at login
  ver: number;
  // Expiry, seconds since epoch
  exp: number;
};

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function signSessionToken(payload: SessionPayload, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

// Returns the payload if the signature is valid and the token has not
// expired, otherwise null.
export function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
): SessionPayload | null {
  if (!token || !secret) return null;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra !== undefined) return null;

  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (
      typeof payload.sub !== "string" ||
      !Number.isInteger(payload.ver) ||
      typeof payload.exp !== "number" ||
      payload.exp * 1000 <= Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
