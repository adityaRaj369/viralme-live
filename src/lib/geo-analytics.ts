/**
 * Real click/view analytics with country.
 * Never invents numbers — empty until events are recorded.
 */
import { DEMO_AUTH } from "@/lib/auth";

export type GeoHit = {
  listingId: string;
  slug: string;
  type: "LISTING_VIEW" | "EXTERNAL_CLICK" | "LISTING_CLICK";
  country: string; // ISO-2 or "XX"
  region?: string | null;
  city?: string | null;
  createdAt: Date;
};

const g = globalThis as unknown as {
  __viralGeoHits?: GeoHit[];
};

function hits(): GeoHit[] {
  if (!g.__viralGeoHits) g.__viralGeoHits = [];
  return g.__viralGeoHits;
}

export function recordGeoHit(hit: Omit<GeoHit, "createdAt"> & { createdAt?: Date }) {
  hits().push({ ...hit, createdAt: hit.createdAt ?? new Date() });
  // Cap memory in long-running serverless instances
  if (hits().length > 5000) {
    g.__viralGeoHits = hits().slice(-4000);
  }
}

export function getListingClickCount(listingId: string) {
  return hits().filter((h) => h.listingId === listingId && h.type === "EXTERNAL_CLICK").length;
}

function aggregateHits(mine: GeoHit[]) {
  const views = mine.filter((h) => h.type === "LISTING_VIEW").length;
  const clicks = mine.filter((h) => h.type === "EXTERNAL_CLICK" || h.type === "LISTING_CLICK").length;

  const byCountry = new Map<string, { clicks: number; views: number }>();
  for (const h of mine) {
    const key = h.country || "XX";
    const row = byCountry.get(key) ?? { clicks: 0, views: 0 };
    if (h.type === "LISTING_VIEW") row.views += 1;
    else row.clicks += 1;
    byCountry.set(key, row);
  }

  const byListing = new Map<string, { clicks: number; views: number; slug: string }>();
  for (const h of mine) {
    const row = byListing.get(h.listingId) ?? { clicks: 0, views: 0, slug: h.slug };
    if (h.type === "LISTING_VIEW") row.views += 1;
    else row.clicks += 1;
    byListing.set(h.listingId, row);
  }

  return {
    totals: { views, clicks, events: mine.length },
    byCountry: Array.from(byCountry.entries())
      .map(([country, v]) => ({ country, ...v }))
      .sort((a, b) => b.clicks + b.views - (a.clicks + a.views)),
    byListing: Array.from(byListing.entries()).map(([listingId, v]) => ({
      listingId,
      ...v,
    })),
  };
}

export function getOwnerAnalytics(listingIds: string[], days = 30) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const mine = hits().filter(
    (h) => listingIds.includes(h.listingId) && h.createdAt.getTime() >= since,
  );

  return {
    ...aggregateHits(mine),
    isDemoMemory: DEMO_AUTH,
  };
}

/** Load country analytics from DB events (production). Empty = no fake data. */
export async function getOwnerAnalyticsFromDb(listingIds: string[], days = 30) {
  if (!listingIds.length) {
    return {
      totals: { views: 0, clicks: 0, events: 0 },
      byCountry: [] as { country: string; clicks: number; views: number }[],
      byListing: [] as { listingId: string; clicks: number; views: number; slug: string }[],
      isDemoMemory: false,
    };
  }

  try {
    const { prisma } = await import("@/lib/db");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await prisma.analyticsEvent.findMany({
      where: {
        listingId: { in: listingIds },
        createdAt: { gte: since },
        type: { in: ["LISTING_VIEW", "EXTERNAL_CLICK", "LISTING_CLICK"] },
      },
      select: { listingId: true, type: true, metadata: true, createdAt: true },
      take: 5000,
    });

    const slugById = new Map(
      (
        await prisma.listing.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, slug: true },
        })
      ).map((l) => [l.id, l.slug] as const),
    );

    const mine: GeoHit[] = events
      .filter((e): e is typeof e & { listingId: string } => !!e.listingId)
      .map((e) => {
        const meta = (e.metadata ?? {}) as { country?: string; region?: string; city?: string };
        return {
          listingId: e.listingId,
          slug: slugById.get(e.listingId) ?? e.listingId,
          type: e.type as GeoHit["type"],
          country: (meta.country || "XX").toUpperCase(),
          region: meta.region ?? null,
          city: meta.city ?? null,
          createdAt: e.createdAt,
        };
      });

    return { ...aggregateHits(mine), isDemoMemory: false };
  } catch {
    return getOwnerAnalytics(listingIds, days);
  }
}

export function readGeoFromHeaders(headers: Headers) {
  // Vercel provides these automatically on edge/serverless
  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    "XX";
  const region = headers.get("x-vercel-ip-country-region") || headers.get("x-region") || null;
  const city = headers.get("x-vercel-ip-city") || null;
  return {
    country: country.toUpperCase(),
    region,
    city: city ? decodeURIComponent(city) : null,
  };
}

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  SG: "Singapore",
  MY: "Malaysia",
  PH: "Philippines",
  ID: "Indonesia",
  TH: "Thailand",
  VN: "Vietnam",
  AE: "UAE",
  SA: "Saudi Arabia",
  GB: "United Kingdom",
  DE: "Germany",
  AU: "Australia",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  HK: "Hong Kong",
  BD: "Bangladesh",
  PK: "Pakistan",
  LK: "Sri Lanka",
  NP: "Nepal",
  XX: "Unknown",
};

export function countryLabel(code: string) {
  return COUNTRY_NAMES[code] ?? code;
}
