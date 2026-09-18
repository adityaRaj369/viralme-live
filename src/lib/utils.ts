import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSiteUrl } from "@/lib/site-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatCurrency(amount: number | string, currency = "USD") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function absoluteUrl(path: string) {
  const base = getSiteUrl();
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(str: string, len: number) {
  if (str.length <= len) return str;
  return `${str.slice(0, len - 1)}…`;
}
