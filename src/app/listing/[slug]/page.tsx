import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getListingBySlug } from "@/modules/listings/service";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, absoluteUrl } from "@/lib/utils";
import { demoFindBySlug, demoGetListings, useDemoStore } from "@/lib/demo-store";
import { logoUrlFromHref } from "@/lib/favicon";
import { RankCard } from "@/components/cards/rank-card";
import { readGeoFromHeaders, recordGeoHit } from "@/lib/geo-analytics";
import { trackEvent } from "@/modules/analytics/service";
import { SHELL } from "@/lib/shell";

export const dynamic = "force-dynamic";

function getDemoListing(slug: string) {
  return demoFindBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (useDemoStore()) {
    const demo = getDemoListing(slug);
    if (demo) {
      return {
        title: demo.title,
        description: demo.description ?? undefined,
        alternates: { canonical: absoluteUrl(`/listing/${demo.slug}`) },
      };
    }
  }
  try {
    const listing = await getListingBySlug(slug);
    return {
      title: listing.title,
      description: listing.description ?? undefined,
      alternates: { canonical: absoluteUrl(`/listing/${listing.slug}`) },
    };
  } catch {
    return { title: "Listing" };
  }
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (useDemoStore()) {
    const demo = getDemoListing(slug);
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
    const ranked = demoGetListings({ board: "alltime", page: 1, pageSize: 500 }).items;
    const rank = ranked.findIndex((i) => i.slug === demo.slug) + 1 || 1;
    const logo = demo.thumbnailUrl || logoUrlFromHref(demo.externalUrl);
    return (
      <div className={`${SHELL} pb-16 pt-10`}>
        <div className="mx-auto max-w-[720px]">
          <div className="ob-card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-border bg-muted-bg">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-accent">#{rank}</div>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{demo.title}</h1>
                {demo.tagline ? <p className="mt-1 text-muted">{demo.tagline}</p> : null}
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{demo.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
                  <span>{formatCurrency(demo.rankAmount)} bid</span>
                  <span>{formatNumber(demo.clickCount)} clicks</span>
                  <span>{demo.categoryName}</span>
                </div>
                {demo.externalUrl ? (
                  <a href={`/api/go/${demo.slug}`} className="mt-6 inline-block">
                    <Button className="rounded-full">
                      Visit site <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/" className="text-sm font-semibold text-accent">
              ← Back to leaderboard
            </Link>
          </div>
          <div className="mt-8">
            <RankCard
              item={{
                id: demo.id,
                slug: demo.slug,
                title: demo.title,
                tagline: demo.tagline,
                description: demo.description,
                rank,
                displayAmount: demo.rankAmount,
                externalUrl: demo.externalUrl,
                clickCount: demo.clickCount,
                createdAt: demo.createdAt,
                categoryName: demo.categoryName,
                thumbnailUrl: demo.thumbnailUrl,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  let listing;
  try {
    listing = await getListingBySlug(slug);
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
