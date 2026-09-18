import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber, cn } from "@/lib/utils";

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  contentType: string;
  platform?: string | null;
  price?: number | string | null;
  currency?: string | null;
  viewCount: number;
  likeCount: number;
  saveCount?: number;
  ranking?: number | null;
  profile?: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  categoryName?: string | null;
  promoted?: { type: string; position?: number | null } | null;
  externalUrl?: string | null;
};

function platformLabel(platform?: string | null) {
  if (!platform || platform === "NONE") return null;
  return platform.replace(/_/g, " ");
}

export function ListingCard({
  listing,
  className,
}: {
  listing: ListingCardData;
  className?: string;
}) {
  const isVideo =
    listing.contentType === "VIDEO" ||
    listing.platform === "YOUTUBE" ||
    listing.platform === "YOUTUBE_SHORTS" ||
    listing.platform === "INSTAGRAM";
  const sponsored = Boolean(listing.promoted);

  return (
    <article
      className={cn(
        "group card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      <Link href={`/listing/${listing.slug}`} className="relative block overflow-hidden">
        <div
          className={cn(
            "relative bg-muted-bg",
            isVideo && (listing.platform === "YOUTUBE_SHORTS" || listing.platform === "INSTAGRAM")
              ? "aspect-[9/14]"
              : "aspect-[4/3]",
          )}
        >
          {listing.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.thumbnailUrl}
              alt={listing.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">No image</div>
          )}
          {isVideo ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </span>
          ) : null}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {sponsored ? (
              <Badge variant="sponsored">
                {listing.promoted?.type?.includes("FEATURE") ? "Featured" : "Sponsored"}
              </Badge>
            ) : null}
            {listing.ranking ? (
              <Badge variant="accent">#{listing.ranking} Placement</Badge>
            ) : null}
            {platformLabel(listing.platform) ? (
              <Badge variant="outline">{platformLabel(listing.platform)}</Badge>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link href={`/listing/${listing.slug}`} className="line-clamp-2 text-[15px] font-semibold leading-snug hover:text-accent">
            {listing.title}
          </Link>
          {listing.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{listing.description}</p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex min-w-0 flex-col gap-1 text-xs">
            <span className="rounded-md bg-muted-bg px-2 py-1 font-medium text-muted w-fit">
              {listing.categoryName ?? listing.contentType}
            </span>
            {listing.profile ? (
              <Link
                href={`/profile/${listing.profile.username}`}
                className="truncate font-medium text-foreground hover:text-accent"
              >
                @{listing.profile.username}
              </Link>
            ) : null}
          </div>
          {listing.externalUrl ? (
            <a
              href={listing.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
              onClick={(e) => e.stopPropagation()}
            >
              {listing.contentType === "VIDEO" ? "Watch" : "View"}{" "}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link
              href={`/listing/${listing.slug}`}
              className="inline-flex shrink-0 items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted-bg"
            >
              Open
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCard(props: { listing: ListingCardData }) {
  return <ListingCard listing={props.listing} />;
}
export function VideoCard(props: { listing: ListingCardData }) {
  return <ListingCard listing={props.listing} />;
}
export function FoodCard(props: { listing: ListingCardData }) {
  return <ListingCard listing={props.listing} />;
}
export function GroceryCard(props: { listing: ListingCardData }) {
  return <ListingCard listing={props.listing} />;
}
export function DealCard(props: { listing: ListingCardData }) {
  return <ListingCard listing={props.listing} />;
}
export function ServiceCard(props: { listing: ListingCardData }) {
  return <ListingCard listing={props.listing} />;
}
export function CreatorCard({
  profile,
}: {
  profile: {
    username: string;
    displayName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    followerCount: number;
    listingCount?: number;
    isVerified?: boolean;
  };
}) {
  return (
    <Link
      href={`/profile/${profile.username}`}
      className="group card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-muted-bg">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold">
              {profile.displayName.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold group-hover:text-accent">
            {profile.displayName}
            {profile.isVerified ? " ✓" : ""}
          </div>
          <div className="text-sm text-muted">@{profile.username}</div>
        </div>
      </div>
      {profile.bio ? <p className="mt-3 line-clamp-2 text-sm text-muted">{profile.bio}</p> : null}
      <div className="mt-4 flex gap-4 text-xs text-muted">
        <span>{formatNumber(profile.followerCount)} followers</span>
        {typeof profile.listingCount === "number" ? (
          <span>{formatNumber(profile.listingCount)} listings</span>
        ) : null}
      </div>
    </Link>
  );
}

export function ProfileCard(props: {
  profile: {
    username: string;
    displayName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    followerCount: number;
    listingCount?: number;
    isVerified?: boolean;
  };
}) {
  return <CreatorCard profile={props.profile} />;
}

export function ListingGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}
