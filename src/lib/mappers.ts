import type { ListingCardData } from "@/components/cards/listing-card";

type ListingLike = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  contentType: string;
  platform?: string | null;
  price?: unknown;
  currency?: string | null;
  viewCount: number;
  likeCount: number;
  saveCount?: number;
  externalUrl?: string | null;
  profile?: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  categories?: { category: { name: string; slug: string } }[];
  promotions?: { type: string; slotPosition?: number | null }[];
  promoted?: { type: string; position?: number | null } | null;
};

export function toListingCard(
  listing: ListingLike,
  ranking?: number | null,
): ListingCardData {
  const promo = listing.promoted ?? listing.promotions?.[0];
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    thumbnailUrl: listing.thumbnailUrl,
    contentType: listing.contentType,
    platform: listing.platform,
    price: listing.price != null ? Number(listing.price) : null,
    currency: listing.currency,
    viewCount: listing.viewCount,
    likeCount: listing.likeCount,
    saveCount: listing.saveCount,
    ranking: ranking ?? (promo && "slotPosition" in promo ? promo.slotPosition : promo && "position" in promo ? (promo as { position?: number }).position : null),
    profile: listing.profile,
    categoryName: listing.categories?.[0]?.category.name,
    promoted: promo
      ? {
          type: promo.type,
          position:
            "slotPosition" in promo
              ? promo.slotPosition
              : "position" in promo
                ? (promo as { position?: number | null }).position
                : null,
        }
      : null,
    externalUrl: listing.externalUrl,
  };
}
