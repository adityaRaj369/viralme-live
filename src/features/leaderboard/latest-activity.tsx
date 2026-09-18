"use client";

import { useState } from "react";
import Link from "next/link";
import { productHref } from "@/lib/product-path";

export type ActivityItem = {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  rank: number;
  displayAmount: number;
  currency: string;
  updatedAt: Date | string;
  domain?: string | null;
  externalUrl?: string | null;
};

function timeAgo(date: Date | string) {
  const t = typeof date === "string" ? new Date(date) : date;
  const hours = Math.floor((Date.now() - t.getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 48) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function LatestActivity({
  items,
  initial = 5,
  step = 10,
}: {
  items: ActivityItem[];
  initial?: number;
  step?: number;
}) {
  const [visible, setVisible] = useState(initial);
  if (!items.length) return null;

  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  return (
    <section className="mt-14">
      <h2 className="text-lg font-bold tracking-tight sm:text-xl">Latest activity</h2>
      <ul className="mt-4 space-y-0 divide-y divide-border rounded-[24px] border border-border bg-card/60">
        {shown.map((item) => {
          const href = productHref({
            slug: item.slug,
            domain: item.domain,
            externalUrl: item.externalUrl,
          });
          const label = item.tagline ? `${item.title} · ${item.tagline}` : item.title;
          return (
            <li key={item.id}>
              <Link
                href={href}
                className="flex flex-col gap-0.5 px-4 py-3.5 transition hover:bg-muted-bg/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
              >
                <span className="min-w-0 truncate text-sm font-semibold">{label}</span>
                <span className="flex shrink-0 items-center gap-3 text-sm text-muted">
                  <span>
                    at #{item.rank} · {formatMoney(item.displayAmount, item.currency)}
                  </span>
                  <span className="text-xs">{timeAgo(item.updatedAt)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + step)}
          className="mt-3 text-sm font-semibold text-accent hover:text-accent-hover"
        >
          Show more
        </button>
      ) : null}
    </section>
  );
}
