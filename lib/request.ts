/**
 * Fixed-window in-memory rate limiter. State is per serverless instance, so this
 * is a best-effort abuse brake rather than a hard guarantee — enough to stop a
 * script hammering the Checkout endpoint from one address.
 */
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now - v.windowStart > WINDOW_MS) hits.delete(k);
  }
  return entry.count <= limit;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Public origin of the current deployment, honoring Vercel's forwarding headers. */
export function requestOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
