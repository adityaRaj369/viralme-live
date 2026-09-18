import { APP_DOMAIN } from "@/lib/constants";

/** Safe absolute site origin — never throws on bad env. */
export function getSiteUrl() {
  const fallback = `https://${APP_DOMAIN || "viralme.live"}`;
  const raw = (process.env.NEXT_PUBLIC_APP_URL || "").trim();
  if (!raw) return fallback;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProto).origin;
  } catch {
    return fallback;
  }
}
