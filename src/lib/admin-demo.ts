/**
 * In-memory admin CMS (works without Postgres while DEMO_AUTH=true).
 */
import { OUTBID_CATEGORIES } from "@/lib/outbid-categories";
import { slugify } from "@/lib/utils";

export type AdminCategory = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  status: "ACTIVE" | "DISABLED";
  sortOrder: number;
  icon: string;
};

export type AdminSettings = Record<string, string | number | boolean>;

export type FaqItem = { q: string; a: string };
export type Testimonial = { name: string; handle: string; body: string };

export type SiteContent = {
  aboutIntro: string;
  aboutAfterLive: string;
  testimonials: Testimonial[];
  faq: FaqItem[];
  rules: string[];
  terms: string;
  privacy: string;
  imprint: string;
  footerBlurb: string;
  homeEmpty: string;
};

export type PublicCategory = {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  icon: string;
};

const g = globalThis as unknown as {
  __viralAdminCategoriesV3?: AdminCategory[];
  __viralAdminSettings?: AdminSettings;
  __viralSiteContentV2?: SiteContent;
};

function defaultContent(): SiteContent {
  return {
    aboutIntro:
      "viralme.live started as a simple side project: no ads, no API keys, no revenue sharing. Just claim #1 — that's it.",
    aboutAfterLive: "The board is still here. Same rules. Same idea. Rank is what you pay — nothing else.",
    testimonials: [],
    faq: [
      {
        q: "How does ranking work?",
        a: "Rank is what you pay — nothing else. Higher amount = higher on the board. No votes, likes, or engagement.",
      },
      {
        q: "How do I claim #1?",
        a: "Pay at least the current #1 amount plus the bump configured by the admin. Whole currency units only.",
      },
      {
        q: "What's the difference between All-time and Today?",
        a: "All-time is cumulative and never expires. Today resets every UTC midnight.",
      },
      {
        q: "Can I raise my existing listing?",
        a: "Yes. Pay the difference between your new target amount and your current amount.",
      },
      {
        q: "Do clicks affect rank?",
        a: "No. Clicks are analytics only.",
      },
    ],
    rules: [
      "Rank is determined only by the amount paid.",
      "To take #1 you must pay at least current #1 + the configured bump.",
      "All-time ranks never expire. Today resets at UTC midnight.",
      "No fake engagement. No votes. No likes.",
      "Listings must be real products or profiles — spam may be removed by admins.",
      "Refunds are at admin discretion for clear payment errors only.",
    ],
    terms:
      "By using viralme.live you agree that ranks are paid placements, not endorsements. You are responsible for your listing content and destination URL. We may remove listings that violate law or these rules.",
    privacy:
      "We store account email (when login is enabled), listing data you submit, payment metadata from the provider, and anonymized click country for analytics. We do not sell personal data. Contact support to request deletion.",
    imprint: "viralme.live — India & Asia pay-to-rank leaderboard.\nContact: hello@viralme.live",
    footerBlurb: "a public pay-to-rank leaderboard. Rank is what you pay — nothing else.",
    homeEmpty: "No ranks claimed yet. Be the first — paste a URL or @handle and claim #1.",
  };
}

function cats(): AdminCategory[] {
  if (!g.__viralAdminCategoriesV3) {
    g.__viralAdminCategoriesV3 = OUTBID_CATEGORIES.filter((c) => c.slug !== "all").map((c, i) => ({
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      slug: c.slug,
      description: `${c.name} paid ranking board`,
      status: "ACTIVE" as const,
      sortOrder: i + 1,
      icon: c.icon,
    }));
  }
  return g.__viralAdminCategoriesV3;
}

function settings(): AdminSettings {
  if (!g.__viralAdminSettings) {
    g.__viralAdminSettings = {
      siteName: "viralme.live",
      tagline: "Claim a rank on the public leaderboard.",
      supportEmail: "hello@viralme.live",
      rankMinAmount: 500,
      rankBumpAmount: 100,
      rankCurrency: "INR",
      region: "India & Asia",
      enablePaidPromotions: true,
      showVisitorStats: true,
    };
  }
  return g.__viralAdminSettings;
}

function content(): SiteContent {
  if (!g.__viralSiteContentV2) g.__viralSiteContentV2 = defaultContent();
  return g.__viralSiteContentV2;
}

/** Home chips use shortName; categories page uses fullName */
export function getPublicCategories(): PublicCategory[] {
  const active = adminListCategories().filter((c) => c.status === "ACTIVE");
  return [
    { id: "cat-all", name: "All", fullName: "All", slug: "all", icon: "sparkles" },
    ...active.map((c) => ({
      id: c.id,
      name: c.shortName,
      fullName: c.name,
      slug: c.slug,
      icon: c.icon,
    })),
  ];
}

export function getPublicCategoryBySlug(slug: string): PublicCategory | null {
  if (slug === "all") {
    return { id: "cat-all", name: "All", fullName: "All", slug: "all", icon: "sparkles" };
  }
  const hit = adminListCategories().find((c) => c.slug === slug && c.status === "ACTIVE");
  if (!hit) return null;
  return {
    id: hit.id,
    name: hit.shortName,
    fullName: hit.name,
    slug: hit.slug,
    icon: hit.icon,
  };
}

export function getDemoRankConfig() {
  const s = adminGetSettings();
  return {
    minAmount: Number(s.rankMinAmount) || 500,
    bumpAmount: Number(s.rankBumpAmount) || 100,
    currency: String(s.rankCurrency || "INR"),
  };
}

export function adminListCategories() {
  return [...cats()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function adminCreateCategory(input: {
  name: string;
  shortName?: string;
  description?: string;
  icon?: string;
}) {
  const list = cats();
  const name = input.name.trim();
  if (!name || name.length > 80) throw new Error("Invalid category name");
  const shortName = (input.shortName?.trim() || name.split(/[&,]/)[0]?.trim() || name).slice(0, 32);
  const slug = slugify(shortName) || `cat-${Date.now()}`;
  if (list.some((c) => c.slug === slug)) throw new Error("Category slug already exists");
  const row: AdminCategory = {
    id: `cat-custom-${Date.now()}`,
    name,
    shortName,
    slug,
    description: (input.description?.trim() || `${name} board`).slice(0, 280),
    status: "ACTIVE",
    sortOrder: list.length + 1,
    icon: (input.icon || "sparkles").slice(0, 32),
  };
  list.push(row);
  return row;
}

export function adminUpdateCategory(
  id: string,
  patch: Partial<
    Pick<AdminCategory, "name" | "shortName" | "description" | "status" | "sortOrder" | "icon">
  >,
) {
  const row = cats().find((c) => c.id === id);
  if (!row) throw new Error("Category not found");
  if (patch.name !== undefined) {
    const name = String(patch.name).trim();
    if (!name || name.length > 80) throw new Error("Invalid name");
    row.name = name;
  }
  if (patch.shortName !== undefined) row.shortName = String(patch.shortName).trim().slice(0, 32);
  if (patch.description !== undefined) row.description = String(patch.description).slice(0, 280);
  if (patch.status === "ACTIVE" || patch.status === "DISABLED") row.status = patch.status;
  if (typeof patch.sortOrder === "number") row.sortOrder = patch.sortOrder;
  if (patch.icon !== undefined) row.icon = String(patch.icon).slice(0, 32);
  return row;
}

export function adminGetSettings() {
  return { ...settings() };
}

export function adminSetSettings(patch: Partial<AdminSettings>) {
  const s = settings();
  for (const [k, v] of Object.entries(patch)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(k)) continue;
    if (typeof v === "string") s[k] = v.slice(0, 500);
    else if (typeof v === "number" && Number.isFinite(v)) s[k] = v;
    else if (typeof v === "boolean") s[k] = v;
  }
  return adminGetSettings();
}

export function adminGetContent(): SiteContent {
  return structuredClone(content());
}

export function adminSetContent(patch: Partial<SiteContent>) {
  const c = content();
  if (typeof patch.aboutIntro === "string") c.aboutIntro = patch.aboutIntro.slice(0, 4000);
  if (typeof patch.aboutAfterLive === "string") c.aboutAfterLive = patch.aboutAfterLive.slice(0, 4000);
  if (typeof patch.terms === "string") c.terms = patch.terms.slice(0, 20000);
  if (typeof patch.privacy === "string") c.privacy = patch.privacy.slice(0, 20000);
  if (typeof patch.imprint === "string") c.imprint = patch.imprint.slice(0, 4000);
  if (typeof patch.footerBlurb === "string") c.footerBlurb = patch.footerBlurb.slice(0, 500);
  if (typeof patch.homeEmpty === "string") c.homeEmpty = patch.homeEmpty.slice(0, 500);
  if (Array.isArray(patch.faq)) {
    c.faq = patch.faq
      .slice(0, 40)
      .map((f) => ({
        q: String(f.q ?? "").slice(0, 200),
        a: String(f.a ?? "").slice(0, 2000),
      }))
      .filter((f) => f.q && f.a);
  }
  if (Array.isArray(patch.rules)) {
    c.rules = patch.rules.map((r) => String(r).slice(0, 500)).filter(Boolean).slice(0, 40);
  }
  if (Array.isArray(patch.testimonials)) {
    c.testimonials = patch.testimonials
      .slice(0, 20)
      .map((t) => ({
        name: String(t.name ?? "").slice(0, 80),
        handle: String(t.handle ?? "").slice(0, 80),
        body: String(t.body ?? "").slice(0, 1000),
      }))
      .filter((t) => t.name && t.body);
  }
  return adminGetContent();
}
