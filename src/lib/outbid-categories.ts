/**
 * Exact outbid.lol category catalog + URL slugs.
 * shortName = home chip; name = full title; pathSlug = /category/[pathSlug]
 */
export type OutbidCategory = {
  id: string;
  shortName: string;
  name: string;
  /** Internal/filter slug */
  slug: string;
  /** outbid.lol /category/… path */
  pathSlug: string;
  icon: string;
};

export const OUTBID_CATEGORIES: OutbidCategory[] = [
  { id: "cat-all", shortName: "All", name: "All", slug: "all", pathSlug: "", icon: "sparkles" },
  {
    id: "cat-leaderboards",
    shortName: "Leaderboards",
    name: "Leaderboards & Attention Markets",
    slug: "leaderboards",
    pathSlug: "leaderboards-attention",
    icon: "trophy",
  },
  {
    id: "cat-seo",
    shortName: "SEO",
    name: "SEO & AI Visibility",
    slug: "seo",
    pathSlug: "seo-ai-visibility",
    icon: "sparkles",
  },
  {
    id: "cat-marketing",
    shortName: "Marketing",
    name: "Marketing & Advertising",
    slug: "marketing",
    pathSlug: "marketing-advertising",
    icon: "megaphone",
  },
  {
    id: "cat-productivity",
    shortName: "Productivity",
    name: "Productivity & Personal Tools",
    slug: "productivity",
    pathSlug: "productivity-personal-tools",
    icon: "list",
  },
  {
    id: "cat-agents",
    shortName: "Agents",
    name: "AI Agents & Infrastructure",
    slug: "agents",
    pathSlug: "ai-agents-infrastructure",
    icon: "bot",
  },
  {
    id: "cat-crypto",
    shortName: "Crypto",
    name: "Crypto, Web3 & Investing",
    slug: "crypto",
    pathSlug: "crypto-web3-investing",
    icon: "coins",
  },
  {
    id: "cat-developer",
    shortName: "Developer",
    name: "Developer Tools",
    slug: "developer",
    pathSlug: "developer-tools",
    icon: "code",
  },
  { id: "cat-other", shortName: "Other", name: "Other", slug: "other", pathSlug: "other", icon: "sparkles" },
  {
    id: "cat-health",
    shortName: "Health",
    name: "Health, Fitness & Wellness",
    slug: "health",
    pathSlug: "health-fitness-wellness",
    icon: "heart",
  },
  {
    id: "cat-business",
    shortName: "Business",
    name: "Business, Finance & Legal",
    slug: "business",
    pathSlug: "business-finance-legal",
    icon: "briefcase",
  },
  {
    id: "cat-games",
    shortName: "Games",
    name: "Games & Entertainment",
    slug: "games",
    pathSlug: "games-entertainment",
    icon: "gamepad",
  },
  {
    id: "cat-ecommerce",
    shortName: "Ecommerce",
    name: "Ecommerce & Retail",
    slug: "ecommerce",
    pathSlug: "ecommerce-retail",
    icon: "cart",
  },
  {
    id: "cat-travel",
    shortName: "Travel",
    name: "Travel, Local & Lifestyle",
    slug: "travel",
    pathSlug: "travel-local-lifestyle",
    icon: "plane",
  },
  {
    id: "cat-directories",
    shortName: "Directories",
    name: "Directories, Launch & Discovery",
    slug: "directories",
    pathSlug: "directories-launch-discovery",
    icon: "list",
  },
  {
    id: "cat-agencies",
    shortName: "Agencies",
    name: "Agencies, Studios & Services",
    slug: "agencies",
    pathSlug: "agencies-studios-services",
    icon: "building",
  },
  {
    id: "cat-ai-media",
    shortName: "AI Media",
    name: "AI Media Generation",
    slug: "ai-media",
    pathSlug: "ai-media-generation",
    icon: "sparkles",
  },
  {
    id: "cat-education",
    shortName: "Education",
    name: "Education & Learning",
    slug: "education",
    pathSlug: "education-learning",
    icon: "book",
  },
  {
    id: "cat-social",
    shortName: "Social",
    name: "Social Media & Creator Tools",
    slug: "social",
    pathSlug: "social-media-creator-tools",
    icon: "users",
  },
  {
    id: "cat-people",
    shortName: "People",
    name: "People & Profiles",
    slug: "people",
    pathSlug: "people-profiles",
    icon: "user",
  },
  {
    id: "cat-design",
    shortName: "Design",
    name: "Design & Creative",
    slug: "design",
    pathSlug: "design-creative",
    icon: "pen",
  },
  {
    id: "cat-hiring",
    shortName: "Hiring",
    name: "Hiring, Jobs & Careers",
    slug: "hiring",
    pathSlug: "hiring-jobs-careers",
    icon: "briefcase",
  },
  {
    id: "cat-domains",
    shortName: "Domains",
    name: "Domains & Web Assets",
    slug: "domains",
    pathSlug: "domains-web-assets",
    icon: "globe",
  },
  {
    id: "cat-security",
    shortName: "Security",
    name: "Security, Privacy & Compliance",
    slug: "security",
    pathSlug: "security-privacy-compliance",
    icon: "shield",
  },
  {
    id: "cat-sales",
    shortName: "Sales",
    name: "Sales & Lead Generation",
    slug: "sales",
    pathSlug: "sales-lead-generation",
    icon: "megaphone",
  },
  {
    id: "cat-news",
    shortName: "News",
    name: "Media & News",
    slug: "news",
    pathSlug: "media-news",
    icon: "newspaper",
  },
  {
    id: "cat-real-estate",
    shortName: "Real Estate",
    name: "Real Estate & Property",
    slug: "real-estate",
    pathSlug: "real-estate-property",
    icon: "home",
  },
  {
    id: "cat-writing",
    shortName: "Writing",
    name: "Writing & Content",
    slug: "writing",
    pathSlug: "writing-content",
    icon: "pen",
  },
  {
    id: "cat-audio",
    shortName: "Audio",
    name: "Audio, Voice & Podcasting",
    slug: "audio",
    pathSlug: "audio-voice-podcasting",
    icon: "music",
  },
  {
    id: "cat-analytics",
    shortName: "Analytics",
    name: "Analytics",
    slug: "analytics",
    pathSlug: "analytics",
    icon: "chart",
  },
];

export function findCategoryByPathSlug(pathSlug: string) {
  return OUTBID_CATEGORIES.find((c) => c.pathSlug === pathSlug || c.slug === pathSlug) ?? null;
}

export function categoryBoardHref(c: { slug: string; pathSlug?: string }) {
  if (c.slug === "all" || !c.pathSlug) return "/";
  return `/category/${c.pathSlug}`;
}
