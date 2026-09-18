/**
 * In-memory leaderboard for DEMO_AUTH when Postgres is unavailable.
 */
import { DEMO_AUTH } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { logoUrlFromHref } from "@/lib/favicon";

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
  __mmvDemoListingsV5?: DemoListing[];
  __mmvDemoOrders?: Map<string, DemoOrder>;
};

function seedListing(partial: Omit<DemoListing, "thumbnailUrl" | "updatedAt" | "status" | "ownerId" | "profile"> & {
  thumbnailUrl?: string | null;
  profile?: DemoListing["profile"];
}): DemoListing {
  return {
    ...partial,
    thumbnailUrl: partial.thumbnailUrl ?? logoUrlFromHref(partial.externalUrl),
    updatedAt: new Date(),
    status: "PUBLISHED",
    ownerId: "demo-seed",
    profile: partial.profile ?? {
      username: partial.slug,
      displayName: partial.title,
      avatarUrl: null,
    },
  };
}

function listings(): DemoListing[] {
  if (!g.__mmvDemoListingsV5) {
    const today = new Date().toISOString().slice(0, 10);
    const core: DemoListing[] = [
      seedListing({
        id: "demo-listing-1",
        slug: "see-io",
        title: "see.io",
        tagline: "see your idea live",
        description:
          "AI visibility for your brand across ChatGPT, Claude, Gemini, and Perplexity â€” know when you're mentioned.",
        rankAmount: 17001,
        todayRankAmount: 420,
        todayRankDate: today,
        externalUrl: "https://see.io",
        originalUrl: "https://see.io",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 8 * 86400000),
        publishedAt: new Date(Date.now() - 8 * 86400000),
        categorySlug: "agents",
        categoryName: "Agents",
      }),
      seedListing({
        id: "demo-listing-2",
        slug: "outrank",
        title: "Outrank",
        tagline: "SEO that ships",
        description: "Generate SEO content that actually ranks â€” briefs, drafts, and internal links.",
        rankAmount: 8420,
        todayRankAmount: 180,
        todayRankDate: today,
        externalUrl: "https://outrank.so",
        originalUrl: "https://outrank.so",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 12 * 86400000),
        publishedAt: new Date(Date.now() - 12 * 86400000),
        categorySlug: "seo",
        categoryName: "SEO",
      }),
      seedListing({
        id: "demo-listing-3",
        slug: "framer",
        title: "Framer",
        tagline: "design to site",
        description: "Design and publish stunning sites without writing code.",
        rankAmount: 5100,
        todayRankAmount: 95,
        todayRankDate: today,
        externalUrl: "https://www.framer.com",
        originalUrl: "https://www.framer.com",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 20 * 86400000),
        publishedAt: new Date(Date.now() - 20 * 86400000),
        categorySlug: "productivity",
        categoryName: "Productivity",
      }),
      seedListing({
        id: "demo-listing-4",
        slug: "linear",
        title: "Linear",
        tagline: "build software faster",
        description: "The issue tracking tool you'll enjoy using â€” purpose-built for high-performance teams.",
        rankAmount: 3900,
        todayRankAmount: 40,
        todayRankDate: today,
        externalUrl: "https://linear.app",
        originalUrl: "https://linear.app",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 30 * 86400000),
        publishedAt: new Date(Date.now() - 30 * 86400000),
        categorySlug: "productivity",
        categoryName: "Productivity",
      }),
      seedListing({
        id: "demo-listing-5",
        slug: "notion",
        title: "Notion",
        tagline: "one workspace",
        description: "Notes, docs, wikis, and projects â€” connected in one beautiful workspace.",
        rankAmount: 2750,
        todayRankAmount: 25,
        todayRankDate: today,
        externalUrl: "https://www.notion.so",
        originalUrl: "https://www.notion.so",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 45 * 86400000),
        publishedAt: new Date(Date.now() - 45 * 86400000),
        categorySlug: "productivity",
        categoryName: "Productivity",
      }),
      seedListing({
        id: "demo-listing-6",
        slug: "stripe",
        title: "Stripe",
        tagline: "payments infrastructure",
        description: "Financial infrastructure for the internet â€” accept payments, send payouts, manage revenue.",
        rankAmount: 1999,
        todayRankAmount: 12,
        todayRankDate: today,
        externalUrl: "https://stripe.com",
        originalUrl: "https://stripe.com",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 60 * 86400000),
        publishedAt: new Date(Date.now() - 60 * 86400000),
        categorySlug: "marketing",
        categoryName: "Marketing",
      }),
      seedListing({
        id: "demo-listing-7",
        slug: "vercel",
        title: "Vercel",
        tagline: "frontend cloud",
        description: "Build and deploy the best web experiences with the frontend cloud.",
        rankAmount: 1500,
        todayRankAmount: 8,
        todayRankDate: today,
        externalUrl: "https://vercel.com",
        originalUrl: "https://vercel.com",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 14 * 86400000),
        publishedAt: new Date(Date.now() - 14 * 86400000),
        categorySlug: "productivity",
        categoryName: "Productivity",
      }),
      seedListing({
        id: "demo-listing-8",
        slug: "openai",
        title: "OpenAI",
        tagline: "AI research",
        description: "Creating safe AGI that benefits all of humanity.",
        rankAmount: 1200,
        todayRankAmount: 55,
        todayRankDate: today,
        externalUrl: "https://openai.com",
        originalUrl: "https://openai.com",
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - 4 * 86400000),
        publishedAt: new Date(Date.now() - 4 * 86400000),
        categorySlug: "agents",
        categoryName: "Agents",
      }),
    ];

    const extras = EXTRA_PRODUCTS.map((p, i) => {
      const cat = DEMO_CATEGORIES.find((c) => c.slug === p.category);
      const amount = Math.max(50, 1100 - i * 22);
      return seedListing({
        id: `demo-extra-${i}`,
        slug: p.domain.replace(/\./g, "-"),
        title: p.title,
        tagline: p.tagline,
        description: p.desc,
        rankAmount: amount,
        todayRankAmount: Math.max(5, Math.round(amount * 0.04)),
        todayRankDate: today,
        externalUrl: `https://${p.domain}`,
        originalUrl: `https://${p.domain}`,
        creatorHandle: null,
        clickCount: 0,
        createdAt: new Date(Date.now() - (i + 2) * 86400000),
        publishedAt: new Date(Date.now() - (i + 2) * 86400000),
        categorySlug: p.category,
        categoryName: cat?.name ?? p.category,
      });
    });

    g.__mmvDemoListingsV5 = [...core, ...extras];
  }
  return g.__mmvDemoListingsV5;
}

function orders() {
  if (!g.__mmvDemoOrders) g.__mmvDemoOrders = new Map();
  return g.__mmvDemoOrders;
}

export const DEMO_CATEGORIES = [
  { id: "cat-all", name: "All", slug: "all", icon: "sparkles" },
  { id: "cat-leaderboards", name: "Leaderboards", slug: "leaderboards", icon: "trophy" },
  { id: "cat-seo", name: "SEO", slug: "seo", icon: "sparkles" },
  { id: "cat-marketing", name: "Marketing", slug: "marketing", icon: "megaphone" },
  { id: "cat-productivity", name: "Productivity", slug: "productivity", icon: "list" },
  { id: "cat-agents", name: "Agents", slug: "agents", icon: "bot" },
  { id: "cat-crypto", name: "Crypto", slug: "crypto", icon: "coins" },
  { id: "cat-developer", name: "Developer", slug: "developer", icon: "code" },
  { id: "cat-other", name: "Other", slug: "other", icon: "sparkles" },
  { id: "cat-health", name: "Health", slug: "health", icon: "heart" },
  { id: "cat-business", name: "Business", slug: "business", icon: "briefcase" },
  { id: "cat-games", name: "Games", slug: "games", icon: "gamepad" },
  { id: "cat-ecommerce", name: "Ecommerce", slug: "ecommerce", icon: "cart" },
  { id: "cat-travel", name: "Travel", slug: "travel", icon: "plane" },
  { id: "cat-directories", name: "Directories", slug: "directories", icon: "list" },
  { id: "cat-agencies", name: "Agencies", slug: "agencies", icon: "building" },
  { id: "cat-ai-media", name: "AI Media", slug: "ai-media", icon: "sparkles" },
  { id: "cat-education", name: "Education", slug: "education", icon: "book" },
  { id: "cat-social", name: "Social", slug: "social", icon: "users" },
  { id: "cat-people", name: "People", slug: "people", icon: "user" },
  { id: "cat-design", name: "Design", slug: "design", icon: "pen" },
  { id: "cat-hiring", name: "Hiring", slug: "hiring", icon: "briefcase" },
  { id: "cat-domains", name: "Domains", slug: "domains", icon: "globe" },
  { id: "cat-security", name: "Security", slug: "security", icon: "shield" },
  { id: "cat-sales", name: "Sales", slug: "sales", icon: "megaphone" },
  { id: "cat-news", name: "News", slug: "news", icon: "newspaper" },
  { id: "cat-real-estate", name: "Real Estate", slug: "real-estate", icon: "home" },
  { id: "cat-writing", name: "Writing", slug: "writing", icon: "pen" },
  { id: "cat-audio", name: "Audio", slug: "audio", icon: "music" },
  { id: "cat-analytics", name: "Analytics", slug: "analytics", icon: "chart" },
];

export const DEMO_RANK_CONFIG = {
  minAmount: 500,
  bumpAmount: 100,
  currency: "INR",
};

export const DEMO_GUEST_USER_ID = "demo-guest-id";

const EXTRA_PRODUCTS: { title: string; domain: string; category: string; tagline: string; desc: string }[] = [
  { title: "Tutti", domain: "tutti.so", category: "marketing", tagline: "monetize influence", desc: "Your all-in-one marketplace to monetize influence." },
  { title: "Comp AI", domain: "trycomp.ai", category: "security", tagline: "SOC 2 in weeks", desc: "Automated compliance for startups shipping fast." },
  { title: "Supabase", domain: "supabase.com", category: "developer", tagline: "open source Firebase", desc: "Build in a weekend, scale to millions." },
  { title: "Resend", domain: "resend.com", category: "developer", tagline: "email for developers", desc: "The email API for developers." },
  { title: "Cal.com", domain: "cal.com", category: "productivity", tagline: "scheduling", desc: "The open source Calendly alternative." },
  { title: "Raycast", domain: "raycast.com", category: "productivity", tagline: "supercharged Mac", desc: "Your shortcut to everything." },
  { title: "Figma", domain: "figma.com", category: "design", tagline: "design together", desc: "Collaborative interface design tool." },
  { title: "Loom", domain: "loom.com", category: "ai-media", tagline: "async video", desc: "Record and share video messages instantly." },
  { title: "Webflow", domain: "webflow.com", category: "design", tagline: "no-code sites", desc: "Build production-ready websites visually." },
  { title: "HubSpot", domain: "hubspot.com", category: "sales", tagline: "CRM platform", desc: "Marketing, sales, and service software." },
  { title: "Shopify", domain: "shopify.com", category: "ecommerce", tagline: "sell anywhere", desc: "The commerce platform for growing brands." },
  { title: "Duolingo", domain: "duolingo.com", category: "education", tagline: "learn languages", desc: "The free, fun way to learn a language." },
  { title: "Airbnb", domain: "airbnb.com", category: "travel", tagline: "belong anywhere", desc: "Book unique homes and experiences worldwide." },
  { title: "Coinbase", domain: "coinbase.com", category: "crypto", tagline: "crypto exchange", desc: "The easiest place to buy and sell crypto." },
  { title: "Product Hunt", domain: "producthunt.com", category: "directories", tagline: "new products", desc: "The best new products in tech." },
  { title: "Clutch", domain: "clutch.co", category: "agencies", tagline: "agency reviews", desc: "Verified reviews of B2B service providers." },
  { title: "Substack", domain: "substack.com", category: "writing", tagline: "newsletters", desc: "A place for independent writing." },
  { title: "Spotify", domain: "spotify.com", category: "audio", tagline: "music & podcasts", desc: "Millions of songs and podcasts." },
  { title: "Mixpanel", domain: "mixpanel.com", category: "analytics", tagline: "product analytics", desc: "Understand what users do and why." },
  { title: "Indeed", domain: "indeed.com", category: "hiring", tagline: "job search", desc: "Find your next job opportunity." },
  { title: "Zillow", domain: "zillow.com", category: "real-estate", tagline: "homes", desc: "Find homes for sale and rent." },
  { title: "TechCrunch", domain: "techcrunch.com", category: "news", tagline: "tech news", desc: "Startup and technology news." },
  { title: "Namecheap", domain: "namecheap.com", category: "domains", tagline: "domains & hosting", desc: "Cheap domain names and hosting." },
  { title: "1Password", domain: "1password.com", category: "security", tagline: "password manager", desc: "The password manager for teams and families." },
  { title: "Discord", domain: "discord.com", category: "social", tagline: "communities", desc: "Your place to talk and hang out." },
  { title: "LinkedIn", domain: "linkedin.com", category: "people", tagline: "professional network", desc: "Connect with professionals worldwide." },
  { title: "Steam", domain: "store.steampowered.com", category: "games", tagline: "PC gaming", desc: "The ultimate destination for playing games." },
  { title: "Whoop", domain: "whoop.com", category: "health", tagline: "fitness strap", desc: "Track recovery, strain, and sleep." },
  { title: "Notion Calendar", domain: "calendar.notion.so", category: "productivity", tagline: "time blocking", desc: "A better calendar for your work." },
  { title: "Cursor", domain: "cursor.com", category: "developer", tagline: "AI code editor", desc: "The AI-first code editor." },
  { title: "Perplexity", domain: "perplexity.ai", category: "agents", tagline: "AI search", desc: "Ask anything. Get answers with sources." },
  { title: "Midjourney", domain: "midjourney.com", category: "ai-media", tagline: "AI images", desc: "Create stunning images with AI." },
  { title: "Beehiiv", domain: "beehiiv.com", category: "writing", tagline: "newsletter platform", desc: "The newsletter platform built for growth." },
  { title: "Lemon Squeezy", domain: "lemonsqueezy.com", category: "ecommerce", tagline: "sell digital", desc: "Payments, tax, and subscriptions for creators." },
  { title: "PostHog", domain: "posthog.com", category: "analytics", tagline: "product OS", desc: "Open-source product analytics." },
  { title: "Plausible", domain: "plausible.io", category: "analytics", tagline: "simple analytics", desc: "Privacy-friendly website analytics." },
  { title: "ConvertKit", domain: "convertkit.com", category: "marketing", tagline: "creator email", desc: "Email marketing for creators." },
  { title: "Typeform", domain: "typeform.com", category: "business", tagline: "forms that convert", desc: "People-friendly forms and surveys." },
  { title: "Canva", domain: "canva.com", category: "design", tagline: "design anything", desc: "Create designs for social, print, and video." },
  { title: "Grammarly", domain: "grammarly.com", category: "writing", tagline: "write better", desc: "AI writing assistance for everyone." },
  { title: "Zoom", domain: "zoom.us", category: "business", tagline: "video meetings", desc: "Reliable video meetings for teams." },
  { title: "Twilio", domain: "twilio.com", category: "developer", tagline: "communications API", desc: "Build messaging and voice into your apps." },
];

export function useDemoStore() {
  return DEMO_AUTH;
}

export function demoSiteStats() {
  const all = listings().filter((l) => l.status === "PUBLISHED");
  const revenue = all.reduce((s, l) => s + l.rankAmount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const addedToday = all.filter((l) => l.publishedAt && l.publishedAt.toISOString().slice(0, 10) === today).length;
  const top = [...all].sort((a, b) => b.rankAmount - a.rankAmount)[0];
  return {
    visitors: 128_450 + all.length * 120,
    visitorsToday: 2_840 + all.length * 12,
    online: 18 + (all.length % 40),
    revenue,
    revenueToday: Math.round(revenue * 0.02),
    products: all.length,
    productsToday: addedToday || 3,
    highest: top ? { amount: top.rankAmount, title: top.title, slug: top.slug } : null,
    launchedDaysAgo: 29,
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
  if (opts.categorySlug && opts.categorySlug !== "all" && opts.categorySlug !== "leaderboards") {
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
  const claimPrice = Math.max(DEMO_RANK_CONFIG.minAmount, currentTop + DEMO_RANK_CONFIG.bumpAmount);

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
    config: DEMO_RANK_CONFIG,
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
  const cat =
    DEMO_CATEGORIES.find((c) => c.id === opts.categoryId && c.slug !== "all") ??
    DEMO_CATEGORIES.find((c) => c.slug === "marketing")!;

  let listing = demoFindListingByTarget(opts.targetValue, opts.kind);
  const currentAmount = listing?.rankAmount ?? 0;
  const board = demoGetListings({ board: "alltime", page: 1, pageSize: 1 });

  if (!listing && opts.amount < board.claimPrice) {
    throw new Error(`Claim #1 requires at least ${board.claimPrice} ${DEMO_RANK_CONFIG.currency}`);
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
    currency: DEMO_RANK_CONFIG.currency,
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
      currency: DEMO_RANK_CONFIG.currency,
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

