/**
 * Minimal shared-password auth for /admin.
 *
 * The session cookie holds an HMAC of a fixed message keyed by ADMIN_PASSWORD,
 * so changing the password in Vercel invalidates every existing session.
 * Uses Web Crypto so it works in both the Edge middleware and Node route handlers.
 */
export const ADMIN_COOKIE = "zh_admin";
export const ADMIN_SESSION_DAYS = 30;

const SESSION_MESSAGE = "z-handy-admin-session-v1";

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password && password.length > 0 ? password : null;
}

/** Derives the session token for the currently configured password. */
export async function sessionToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(SESSION_MESSAGE));
  return toHex(signature);
}

/** Constant-time string comparison to avoid leaking match length via timing. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  const password = getAdminPassword();
  if (!password || !cookieValue) return false;
  return safeEqual(cookieValue, await sessionToken(password));
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_SESSION_DAYS * 24 * 60 * 60,
};
