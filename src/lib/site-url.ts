import { APP_DOMAIN } from "@/lib/constants";

/**
 * Safe absolute site origin — never throws on bad env.
 * Prefer server-only `APP_URL` (not NEXT_PUBLIC_*) so the value stays private.
 */
export function getSiteUrl() {
  const fallback = `https://${APP_DOMAIN || "viralme.live"}`;
  const raw = (
    process.env.APP_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ""
  ).trim();

  if (!raw) return fallback;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProto).origin;
  } catch {
    return fallback;
  }
}
