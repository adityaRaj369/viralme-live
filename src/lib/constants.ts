export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "viralme.live";
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "viralme.live";
export const APP_TAGLINE = "Claim a rank on the public leaderboard.";
export const APP_DESCRIPTION =
  "Asia's public pay-to-rank leaderboard for startups and creators — built for India and Asia. Rank is what you pay. No votes. No likes.";
export const APP_REGION = "India & Asia";
export const APP_CURRENCY = process.env.NEXT_PUBLIC_APP_CURRENCY ?? "INR";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@viralme.live";

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 50;

export const CONTENT_TYPE_ROUTES = {
  PRODUCT: "/products",
  VIDEO: "/videos",
  FOOD: "/food",
  GROCERY: "/groceries",
  DEAL: "/deals",
  CREATOR: "/creators",
} as const;
