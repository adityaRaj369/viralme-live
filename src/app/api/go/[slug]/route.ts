import { NextRequest, NextResponse } from "next/server";
import { demoFindBySlug, demoIncrementClick, useDemoStore } from "@/lib/demo-store";
import { readGeoFromHeaders, recordGeoHit } from "@/lib/geo-analytics";
import { prisma } from "@/lib/db";
import { trackEvent } from "@/modules/analytics/service";

/**
 * /api/go/[slug] — track Visit click with country, then redirect.
 * Uses real Vercel geo headers when deployed. Never fabricates counts.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const geo = readGeoFromHeaders(req.headers);

  let externalUrl: string | null = null;

  if (useDemoStore()) {
    const item = demoFindBySlug(slug);
    if (item?.externalUrl) {
      externalUrl = item.externalUrl;
      recordGeoHit({
        listingId: item.id,
        slug,
        type: "EXTERNAL_CLICK",
        country: geo.country,
        region: geo.region,
        city: geo.city,
      });
      demoIncrementClick(slug);
    }
  }

  if (!externalUrl) {
    try {
      const listing = await prisma.listing.findFirst({
        where: { slug, deletedAt: null },
        select: { id: true, externalUrl: true, profileId: true },
      });
      if (listing?.externalUrl) {
        externalUrl = listing.externalUrl;
        trackEvent({
          type: "EXTERNAL_CLICK",
          listingId: listing.id,
          profileId: listing.profileId,
          metadata: {
            country: geo.country,
            region: geo.region,
            city: geo.city,
          },
        });
        recordGeoHit({
          listingId: listing.id,
          slug,
          type: "EXTERNAL_CLICK",
          country: geo.country,
          region: geo.region,
          city: geo.city,
        });
      }
    } catch {
      // ignore DB errors
    }
  }

  if (!externalUrl) {
    return NextResponse.redirect(new URL(`/listing/${slug}`, req.url));
  }

  return NextResponse.redirect(externalUrl, { status: 302 });
}
