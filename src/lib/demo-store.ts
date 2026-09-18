/**
 * In-memory leaderboard for DEMO_AUTH when Postgres is unavailable.
 * Starts EMPTY — no fake seed products. Claims populate the board.
 */
import { DEMO_AUTH } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { logoUrlFromHref } from "@/lib/favicon";
import { OUTBID_CATEGORIES } from "@/lib/outbid-categories";

export type DemoListing = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  rankAmount: number;
  todayRankAmount: number;
  todayRankDate: string | null;
  externalUrl: string | null;
  originalUrl: string | null;
  creatorHandle: string | null;
  thumbnailUrl: string | null;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  status: "PUBLISHED" | "DRAFT";
  ownerId: string;
  categorySlug: string;
  categoryName: string;
  profile: { username: string; displayName: string; avatarUrl: string | null };
};

export type DemoOrder = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "AWAITING_PAYMENT" | "PAID";
  listingId: string;
  targetAmount: number;
  providerOrderId: string;
};

const g = globalThis as unknown as {
  __mmvDemoListingsV6?: DemoListing[];
  __mmvDemoOrders?: Map<string, DemoOrder>;
};

function listings(): DemoListing[] {
  if (!g.__mmvDemoListingsV6) g.__mmvDemoListingsV6 = [];
  return g.__mmvDemoListingsV6;
}

function orders(): Map<string, DemoOrder> {
  if (!g.__mmvDemoOrders) g.__mmvDemoOrders = new Map();
  return g.__mmvDemoOrders;
}

/** Chip labels (short) — same as outbid home pills */
export const DEMO_CATEGORIES = OUTBID_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.shortName,
  fullName: c.name,
  slug: c.slug,
  icon: c.icon,
}));

export const DEMO_RANK_CONFIG = {
  minAmount: 500,
  bumpAmount: 100,
  currency: "INR",
};

export function getDemoRankConfig() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getDemoRankConfig: fromAdmin } = require("@/lib/admin-demo") as {
      getDemoRankConfig: () => typeof DEMO_RANK_CONFIG;
    };
    return fromAdmin();
  } catch {
    return DEMO_RANK_CONFIG;
  }
}

export const DEMO_GUEST_USER_ID = "demo-guest-id";

export function useDemoStore() {
  return DEMO_AUTH;
}

/** Honest stats only — never invents visitor counts. */
export function demoSiteStats() {
  const all = listings().filter((l) => l.status === "PUBLISHED");
  const revenue = all.reduce((s, l) => s + l.rankAmount, 0);
  const clicks = all.reduce((s, l) => s + l.clickCount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const addedToday = all.filter(
    (l) => l.publishedAt && l.publishedAt.toISOString().slice(0, 10) === today,
  ).length;
  const top = [...all].sort((a, b) => b.rankAmount - a.rankAmount)[0];
  return {
    visitors: clicks,
    visitorsToday: 0,
    online: 0,
    revenue,
    revenueToday: all
      .filter((l) => l.todayRankDate === today)
      .reduce((s, l) => s + l.todayRankAmount, 0),
    products: all.length,
    productsToday: addedToday,
    highest: top ? { amount: top.rankAmount, title: top.title, slug: top.slug } : null,
    launchedDaysAgo: 0,
    clicks,
  };
}

export function demoGetListings(opts: {
  board: "alltime" | "today";
  categorySlug?: string;
  page: number;
  pageSize: number;
}) {
  const today = new Date().toISOString().slice(0, 10);
  let items = listings().filter((l) => l.status === "PUBLISHED" && l.rankAmount > 0);

  if (opts.board === "today") {
    items = items.filter((l) => l.todayRankDate === today && l.todayRankAmount > 0);
  }
  if (opts.categorySlug && opts.categorySlug !== "all") {
    items = items.filter((l) => l.categorySlug === opts.categorySlug);
  }

  items = [...items].sort((a, b) => {
    const av = opts.board === "alltime" ? a.rankAmount : a.todayRankAmount;
    const bv = opts.board === "alltime" ? b.rankAmount : b.todayRankAmount;
    if (bv !== av) return bv - av;
    return a.updatedAt.getTime() - b.updatedAt.getTime();
  });

  const total = items.length;
  const skip = (opts.page - 1) * opts.pageSize;
  const pageItems = items.slice(skip, skip + opts.pageSize);
  const top = items[0];
  const currentTop = top
    ? opts.board === "alltime"
      ? top.rankAmount
      : top.todayRankAmount
    : 0;
  const cfg = getDemoRankConfig();
  const claimPrice = Math.max(cfg.minAmount, currentTop + cfg.bumpAmount);

  return {
    items: pageItems.map((item, i) => ({
      ...item,
      rank: skip + i + 1,
      displayAmount: opts.board === "alltime" ? item.rankAmount : item.todayRankAmount,
      categories: [
        {
          category: { name: item.categoryName, slug: item.categorySlug },
        },
      ],
    })),
    total,
    page: opts.page,
    pageSize: opts.pageSize,
    totalPages: Math.ceil(total / opts.pageSize) || 1,
    claimPrice,
    currentTop,
    board: opts.board,
    config: cfg,
  };
}

export function demoFindListingByTarget(value: string, kind: "url" | "handle") {
  return (
    listings().find(
      (l) =>
        l.originalUrl === value ||
        l.externalUrl === value ||
        (kind === "handle" && l.creatorHandle === value),
    ) ?? null
  );
}

function resolveCategory(categoryId?: string) {
  const fromSeed =
    DEMO_CATEGORIES.find((c) => c.id === categoryId && c.slug !== "all") ??
    DEMO_CATEGORIES.find((c) => c.slug === "marketing")!;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { adminListCategories } = require("@/lib/admin-demo") as {
      adminListCategories: () => {
        id: string;
        name: string;
        shortName?: string;
        slug: string;
      }[];
    };
    const hit = adminListCategories().find((c) => c.id === categoryId);
    if (hit) {
      return {
        id: hit.id,
        slug: hit.slug,
        name: hit.shortName ?? hit.name,
        fullName: hit.name,
      };
    }
  } catch {
    // ignore
  }
  return {
    id: fromSeed.id,
    slug: fromSeed.slug,
    name: fromSeed.name,
    fullName: fromSeed.fullName,
  };
}

export function demoCreateClaim(opts: {
  userId: string;
  userName?: string | null;
  userEmail?: string;
  title: string;
  description?: string | null;
  targetValue: string;
  targetUrl: string;
  kind: "url" | "handle";
  amount: number;
  categoryId?: string;
}) {
  const cat = resolveCategory(opts.categoryId);
  let listing = demoFindListingByTarget(opts.targetValue, opts.kind);
  const currentAmount = listing?.rankAmount ?? 0;
  const board = demoGetListings({ board: "alltime", page: 1, pageSize: 1 });
  const cfg = getDemoRankConfig();

  if (!listing && opts.amount < board.claimPrice) {
    throw new Error(`Claim #1 requires at least ${board.claimPrice} ${cfg.currency}`);
  }
  if (listing && opts.amount <= currentAmount) {
    throw new Error(`Raise must be above your current rank amount (${currentAmount})`);
  }

  const chargeAmount = listing ? opts.amount - currentAmount : opts.amount;
  const username = (opts.userEmail?.split("@")[0] || "guest").replace(/[^a-z0-9_]/gi, "").slice(0, 24);

  if (!listing) {
    let slug = slugify(opts.title) || `claim-${Date.now().toString(36)}`;
    if (listings().some((l) => l.slug === slug)) slug = `${slug}-${Date.now().toString(36)}`;
    listing = {
      id: `demo-listing-${Date.now()}`,
      slug,
      title: opts.title,
      tagline: null,
      description: opts.description ?? null,
      rankAmount: 0,
      todayRankAmount: 0,
      todayRankDate: null,
      externalUrl: opts.targetUrl,
      originalUrl: opts.targetValue,
      creatorHandle: opts.kind === "handle" ? opts.targetValue : null,
      thumbnailUrl: logoUrlFromHref(opts.targetUrl),
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      status: "DRAFT",
      ownerId: opts.userId,
      categorySlug: cat.slug,
      categoryName: cat.name,
      profile: {
        username,
        displayName: opts.userName || username,
        avatarUrl: null,
      },
    };
    listings().push(listing);
  }

  const orderId = `demo-order-${Date.now()}`;
  const providerOrderId = `mock_${orderId}`;
  const order: DemoOrder = {
    id: orderId,
    userId: opts.userId,
    amount: chargeAmount,
    currency: cfg.currency,
    status: "AWAITING_PAYMENT",
    listingId: listing.id,
    targetAmount: opts.amount,
    providerOrderId,
  };
  orders().set(providerOrderId, order);
  orders().set(orderId, order);

  return {
    order: {
      id: order.id,
      type: "RANK_CLAIM" as const,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
    },
    payment: {
      id: `demo-pay-${Date.now()}`,
      providerOrderId,
      status: "PENDING" as const,
    },
    checkout: {
      provider: "mock" as const,
      providerOrderId,
      amount: chargeAmount,
      currency: cfg.currency,
      raw: { demo: true },
    },
    listing: { id: listing.id, slug: listing.slug, title: listing.title },
    chargeAmount,
    targetAmount: opts.amount,
    demo: true as const,
  };
}

export function demoFulfillByProviderOrderId(providerOrderId: string, userId?: string) {
  const order = orders().get(providerOrderId);
  if (!order) return null;
  if (userId && order.userId !== userId && order.userId !== DEMO_GUEST_USER_ID) return null;
  if (order.status === "PAID") return { alreadyActivated: true, demo: true };

  const listing = listings().find((l) => l.id === order.listingId);
  if (!listing) return null;

  const today = new Date().toISOString().slice(0, 10);
  const previousToday = listing.todayRankDate === today ? listing.todayRankAmount : 0;

  listing.rankAmount = order.targetAmount;
  listing.todayRankAmount = previousToday + order.amount;
  listing.todayRankDate = today;
  listing.status = "PUBLISHED";
  listing.publishedAt = listing.publishedAt ?? new Date();
  listing.updatedAt = new Date();
  listing.thumbnailUrl = listing.thumbnailUrl || logoUrlFromHref(listing.externalUrl);
  order.status = "PAID";

  return { listingId: listing.id, targetAmount: order.targetAmount, demo: true };
}

export function demoFindBySlug(slug: string) {
  return listings().find((l) => l.slug === slug) ?? null;
}

/** Match outbid /product/{domain} — hostname or slug */
export function demoFindByDomainOrSlug(domainOrSlug: string) {
  const key = domainOrSlug.toLowerCase().replace(/^www\./, "");
  return (
    listings().find((l) => {
      if (l.slug.toLowerCase() === key) return true;
      try {
        const host = l.externalUrl
          ? new URL(l.externalUrl).hostname.replace(/^www\./, "").toLowerCase()
          : "";
        return host === key;
      } catch {
        return false;
      }
    }) ?? null
  );
}

/** Recent claims for Latest activity feed */
export function demoLatestActivity(limit = 40) {
  return [...listings()]
    .filter((l) => l.status === "PUBLISHED" && l.rankAmount > 0)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

export function demoIncrementClick(slug: string) {
  const listing = demoFindBySlug(slug);
  if (!listing) return null;
  listing.clickCount += 1;
  listing.updatedAt = new Date();
  return listing;
}

export function demoListingsForOwner(ownerId: string) {
  return listings().filter((l) => l.ownerId === ownerId && l.status === "PUBLISHED");
}
