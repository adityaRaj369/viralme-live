/**
 * Demo admin store — categories & site settings without Postgres.
 */
import { DEMO_CATEGORIES } from "@/lib/demo-store";
import { slugify } from "@/lib/utils";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "ACTIVE" | "DISABLED";
  sortOrder: number;
  icon: string;
};

export type AdminSettings = Record<string, string | number | boolean>;

const g = globalThis as unknown as {
  __viralAdminCategories?: AdminCategory[];
  __viralAdminSettings?: AdminSettings;
};

function cats(): AdminCategory[] {
  if (!g.__viralAdminCategories) {
    g.__viralAdminCategories = DEMO_CATEGORIES.filter((c) => c.slug !== "all").map((c, i) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: `${c.name} paid ranking board`,
      status: "ACTIVE" as const,
      sortOrder: i + 1,
      icon: c.icon,
    }));
  }
  return g.__viralAdminCategories;
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
    };
  }
  return g.__viralAdminSettings;
}

export function adminListCategories() {
  return [...cats()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function adminCreateCategory(input: { name: string; description?: string; icon?: string }) {
  const list = cats();
  const slug = slugify(input.name) || `cat-${Date.now()}`;
  if (list.some((c) => c.slug === slug)) throw new Error("Category slug already exists");
  const row: AdminCategory = {
    id: `cat-custom-${Date.now()}`,
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || `${input.name} board`,
    status: "ACTIVE",
    sortOrder: list.length + 1,
    icon: input.icon || "sparkles",
  };
  list.push(row);
  return row;
}

export function adminUpdateCategory(
  id: string,
  patch: Partial<Pick<AdminCategory, "name" | "description" | "status" | "sortOrder" | "icon">>,
) {
  const row = cats().find((c) => c.id === id);
  if (!row) throw new Error("Category not found");
  Object.assign(row, patch);
  return row;
}

export function adminGetSettings() {
  return { ...settings() };
}

export function adminSetSetting(key: string, value: string | number | boolean) {
  settings()[key] = value;
  return adminGetSettings();
}
