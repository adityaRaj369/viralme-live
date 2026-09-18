import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getListingBySlug } from "@/modules/listings/service";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, absoluteUrl } from "@/lib/utils";
import {
  demoFindByDomainOrSlug,
  demoGetListings,
  useDemoStore,
} from "@/lib/demo-store";
import { logoUrlFromHref } from "@/lib/favicon";
import { readGeoFromHeaders, recordGeoHit } from "@/lib/geo-analytics";
import { trackEvent } from "@/modules/analytics/service";
import { SHELL } from "@/lib/shell";
import { categoryHrefForSlug, domainFromUrl } from "@/lib/product-path";
import { APP_NAME } from "@/lib/constants";
import { findCategoryByPathSlug } from "@/lib/outbid-categories";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  if (useDemoStore()) {
    const demo = demoFindByDomainOrSlug(domain);
    if (demo) {
      const host = domainFromUrl(demo.externalUrl) ?? demo.slug;
      return {
        title: `${demo.title} · ${APP_NAME}`,
        description: demo.description ?? undefined,
        alternates: { canonical: absoluteUrl(`/product/${host}`) },
      };
    }
  }
  try {
    const listing = await getListingBySlug(domain);
    return {
      title: listing.title,
      description: listing.description ?? undefined,
      alternates: { canonical: absoluteUrl(`/product/${domain}`) },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  if (useDemoStore()) {
    const demo = demoFindByDomainOrSlug(domain);
    if (!demo) notFound();

    const geo = readGeoFromHeaders(await headers());
    recordGeoHit({
      listingId: demo.id,
      slug: demo.slug,
      type: "LISTING_VIEW",
      country: geo.country,
      region: geo.region,
      city: geo.city,
    });

    const overall = demoGetListings({ board: "alltime", page: 1, pageSize: 500 });
    const inCat = demoGetListings({
      board: "alltime",
      categorySlug: demo.categorySlug,
      page: 1,
      pageSize: 500,
    });
    const overallRank = overall.items.findIndex((i) => i.id === demo.id) + 1 || 1;
    const catRank = inCat.items.findIndex((i) => i.id === demo.id) + 1 || 1;
    const catMeta = findCategoryByPathSlug(demo.categorySlug);
    const catHref = categoryHrefForSlug(demo.categorySlug);
    const host = domainFromUrl(demo.externalUrl) ?? demo.slug;
    const logo = demo.thumbnailUrl || logoUrlFromHref(demo.externalUrl);
    const currency = overall.config.currency;
    const claimPrice = Math.max(overall.config.minAmount, demo.rankAmount + overall.config.bumpAmount);
    const peers = inCat.items.filter((i) => i.id !== demo.id).slice(0, 4);

    return (
      <div className={`${SHELL} pb-16 pt-6`}>
        <Link
          href="/stats"
          className="ob-pill mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-[12px] text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          stats→
        </Link>

        <nav className="text-sm text-muted">
          <Link href="/" className="hover:text-accent">
            Leaderboard
          </Link>
          {" · "}
          <Link href={catHref} className="hover:text-accent">
            {catMeta?.name ?? demo.categoryName}
          </Link>
        </nav>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-border bg-muted-bg">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {demo.tagline ? `${demo.title} · ${demo.tagline}` : demo.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <Link href={catHref} className="font-semibold text-accent hover:text-accent-hover">
                {catMeta?.name ?? demo.categoryName}
              </Link>
              <span>{host}</span>
              <span>{formatNumber(demo.clickCount)} clicks</span>
            </div>
            {demo.description ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{demo.description}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {demo.externalUrl ? (
                <a href={`/api/go/${demo.slug}`}>
                  <Button className="rounded-full">
                    Visit {host} <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="ob-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Category rank</div>
            <div className="mt-2 text-3xl font-extrabold text-accent">#{catRank}</div>
            <p className="mt-1 text-sm text-muted">
              of {inCat.total} in {catMeta?.name ?? demo.categoryName}
            </p>
            <Link href={catHref} className="mt-3 inline-block text-sm font-semibold text-accent">
              See category ranking →
            </Link>
          </div>
          <div className="ob-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Overall</div>
            <div className="mt-2 text-3xl font-extrabold text-accent">#{overallRank}</div>
            <p className="mt-1 text-sm text-muted">of {overall.total} on the board</p>
            <Link href="/" className="mt-3 inline-block text-sm font-semibold text-accent">
              See overall ranking →
            </Link>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-bold">About this ranking</h2>
          <p className="mt-2 text-muted">
            {formatNumber(demo.clickCount)} visitors have opened {host}. Current bid{" "}
            {formatCurrency(demo.rankAmount, currency)}.
          </p>
          <div className="mt-6 space-y-4 text-sm text-muted">
            <div>
              <h3 className="font-bold text-foreground">
                What rank does {demo.title} hold on {APP_NAME}?
              </h3>
              <p className="mt-1">
                {demo.title} has spent {formatCurrency(demo.rankAmount, currency)} to rank #{catRank}{" "}
                of {inCat.total} in {catMeta?.name ?? demo.categoryName} and #{overallRank} of{" "}
                {overall.total} overall.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground">How do I outrank {demo.title}?</h3>
              <p className="mt-1">
                Anyone can take this rank for {formatCurrency(claimPrice, currency)} on the{" "}
                {catMeta?.name ?? demo.categoryName} board.
              </p>
            </div>
          </div>
        </section>

        {peers.length ? (
          <section className="mt-12">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Also in {catMeta?.name ?? demo.categoryName}</h2>
              <Link href={catHref} className="text-sm font-semibold text-accent">
                See all
              </Link>
            </div>
            <ul className="ob-card divide-y divide-border overflow-hidden p-0">
              {peers.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${domainFromUrl(p.externalUrl) ?? p.slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted-bg/50"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-bold text-accent">#{p.rank}</span> {p.title}
                    </span>
                    <span className="shrink-0 font-bold text-accent">
                      {formatCurrency(p.displayAmount, currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  let listing;
  try {
    listing = await getListingBySlug(domain);
  } catch {
    notFound();
  }

  const geo = readGeoFromHeaders(await headers());
  trackEvent({
    type: "LISTING_VIEW",
    listingId: listing.id,
    profileId: listing.profileId,
    metadata: { country: geo.country, region: geo.region, city: geo.city },
  });
  recordGeoHit({
    listingId: listing.id,
    slug: listing.slug,
    type: "LISTING_VIEW",
    country: geo.country,
    region: geo.region,
    city: geo.city,
  });

  return (
    <div className={`${SHELL} pb-16 pt-10`}>
      <div className="mx-auto max-w-[720px]">
        <div className="ob-card p-6">
          <h1 className="text-2xl font-extrabold">{listing.title}</h1>
          <p className="mt-2 text-muted">{listing.description}</p>
          {listing.externalUrl ? (
            <a href={`/api/go/${listing.slug}`} className="mt-6 inline-block">
              <Button className="rounded-full">Visit site</Button>
            </a>
          ) : null}
        </div>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-accent">
          ← Back to leaderboard
        </Link>
      </div>
    </div>
  );
}
