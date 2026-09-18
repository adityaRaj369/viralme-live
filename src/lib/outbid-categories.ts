/**
 * Exact outbid.lol category catalog.
 * `shortName` = home chip label; `name` = categories page / board title.
 */
export type OutbidCategory = {
  id: string;
  shortName: string;
  name: string;
  slug: string;
  icon: string;
};

export const OUTBID_CATEGORIES: OutbidCategory[] = [
  { id: "cat-all", shortName: "All", name: "All", slug: "all", icon: "sparkles" },
  {
    id: "cat-leaderboards",
    shortName: "Leaderboards",
    name: "Leaderboards & Attention Markets",
    slug: "leaderboards",
    icon: "trophy",
  },
  { id: "cat-seo", shortName: "SEO", name: "SEO & AI Visibility", slug: "seo", icon: "sparkles" },
  {
    id: "cat-marketing",
    shortName: "Marketing",
    name: "Marketing & Advertising",
    slug: "marketing",
    icon: "megaphone",
  },
  {
    id: "cat-productivity",
    shortName: "Productivity",
    name: "Productivity & Personal Tools",
    slug: "productivity",
    icon: "list",
  },
  {
    id: "cat-agents",
    shortName: "Agents",
    name: "AI Agents & Infrastructure",
    slug: "agents",
    icon: "bot",
  },
  {
    id: "cat-crypto",
    shortName: "Crypto",
    name: "Crypto, Web3 & Investing",
    slug: "crypto",
    icon: "coins",
  },
  {
    id: "cat-developer",
    shortName: "Developer",
    name: "Developer Tools",
    slug: "developer",
    icon: "code",
  },
  { id: "cat-other", shortName: "Other", name: "Other", slug: "other", icon: "sparkles" },
  {
    id: "cat-health",
    shortName: "Health",
    name: "Health, Fitness & Wellness",
    slug: "health",
    icon: "heart",
  },
  {
    id: "cat-business",
    shortName: "Business",
    name: "Business, Finance & Legal",
    slug: "business",
    icon: "briefcase",
  },
  {
    id: "cat-games",
    shortName: "Games",
    name: "Games & Entertainment",
    slug: "games",
    icon: "gamepad",
  },
  {
    id: "cat-ecommerce",
    shortName: "Ecommerce",
    name: "Ecommerce & Retail",
    slug: "ecommerce",
    icon: "cart",
  },
  {
    id: "cat-travel",
    shortName: "Travel",
    name: "Travel, Local & Lifestyle",
    slug: "travel",
    icon: "plane",
  },
  {
    id: "cat-directories",
    shortName: "Directories",
    name: "Directories, Launch & Discovery",
    slug: "directories",
    icon: "list",
  },
  {
    id: "cat-agencies",
    shortName: "Agencies",
    name: "Agencies, Studios & Services",
    slug: "agencies",
    icon: "building",
  },
  {
    id: "cat-ai-media",
    shortName: "AI Media",
    name: "AI Media Generation",
    slug: "ai-media",
    icon: "sparkles",
  },
  {
    id: "cat-education",
    shortName: "Education",
    name: "Education & Learning",
    slug: "education",
    icon: "book",
  },
  {
    id: "cat-social",
    shortName: "Social",
    name: "Social Media & Creator Tools",
    slug: "social",
    icon: "users",
  },
  {
    id: "cat-people",
    shortName: "People",
    name: "People & Profiles",
    slug: "people",
    icon: "user",
  },
  {
    id: "cat-design",
    shortName: "Design",
    name: "Design & Creative",
    slug: "design",
    icon: "pen",
  },
  {
    id: "cat-hiring",
    shortName: "Hiring",
    name: "Hiring, Jobs & Careers",
    slug: "hiring",
    icon: "briefcase",
  },
  {
    id: "cat-domains",
    shortName: "Domains",
    name: "Domains & Web Assets",
    slug: "domains",
    icon: "globe",
  },
  {
    id: "cat-security",
    shortName: "Security",
    name: "Security, Privacy & Compliance",
    slug: "security",
    icon: "shield",
  },
  {
    id: "cat-sales",
    shortName: "Sales",
    name: "Sales & Lead Generation",
    slug: "sales",
    icon: "megaphone",
  },
  { id: "cat-news", shortName: "News", name: "Media & News", slug: "news", icon: "newspaper" },
  {
    id: "cat-real-estate",
    shortName: "Real Estate",
    name: "Real Estate & Property",
    slug: "real-estate",
    icon: "home",
  },
  {
    id: "cat-writing",
    shortName: "Writing",
    name: "Writing & Content",
    slug: "writing",
    icon: "pen",
  },
  {
    id: "cat-audio",
    shortName: "Audio",
    name: "Audio, Voice & Podcasting",
    slug: "audio",
    icon: "music",
  },
  {
    id: "cat-analytics",
    shortName: "Analytics",
    name: "Analytics",
    slug: "analytics",
    icon: "chart",
  },
];

export const OUTBID_CATEGORY_SLUGS = OUTBID_CATEGORIES.map((c) => c.slug);
