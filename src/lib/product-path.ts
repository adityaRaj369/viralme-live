import { OUTBID_CATEGORIES, categoryBoardHref } from "@/lib/outbid-categories";

export function domainFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** outbid-style /product/{domain} — falls back to slug when no domain */
export function productHref(opts: {
  slug: string;
  domain?: string | null;
  externalUrl?: string | null;
}) {
  const domain = opts.domain ?? domainFromUrl(opts.externalUrl);
  if (domain) return `/product/${domain}`;
  return `/product/${opts.slug}`;
}

export function categoryHrefForSlug(slug?: string | null) {
  if (!slug || slug === "all") return "/";
  const hit = OUTBID_CATEGORIES.find((c) => c.slug === slug);
  return categoryBoardHref({ slug: hit?.slug ?? slug, pathSlug: hit?.pathSlug ?? slug });
}
