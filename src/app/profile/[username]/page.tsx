import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/modules/profiles/service";
import { trackEvent } from "@/modules/analytics/service";
import { ListingCard, ListingGrid } from "@/components/cards/listing-card";
import { toListingCard } from "@/lib/mappers";
import { formatNumber, absoluteUrl } from "@/lib/utils";
import { FollowButton } from "@/features/profiles/follow-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  try {
    const { username } = await params;
    const profile = await getProfileByUsername(username);
    return {
      title: `${profile.displayName} (@${profile.username})`,
      description: profile.bio ?? undefined,
      alternates: { canonical: absoluteUrl(`/profile/${profile.username}`) },
    };
  } catch {
    return { title: "Profile" };
  }
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab = "overview" } = await searchParams;
  let profile;
  try {
    profile = await getProfileByUsername(username);
  } catch {
    notFound();
  }

  trackEvent({ type: "PROFILE_VIEW", profileId: profile.id });

  const listings = profile.listings;
  const filtered =
    tab === "products"
      ? listings.filter((l) => l.contentType === "PRODUCT")
      : tab === "videos"
        ? listings.filter((l) => l.contentType === "VIDEO")
        : tab === "deals"
          ? listings.filter((l) => l.contentType === "DEAL")
          : listings;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "listings", label: "Listings" },
    { id: "products", label: "Products" },
    { id: "videos", label: "Videos" },
    { id: "deals", label: "Deals" },
    { id: "about", label: "About" },
  ];

  return (
    <div>
      <div className="h-44 w-full bg-[linear-gradient(135deg,#121216_0%,#1a1a1f_45%,#ff6a4d_160%)] sm:h-56">
        {profile.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-md">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold">
                  {profile.displayName.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold">
                {profile.displayName}
                {profile.isVerified ? " ✓" : ""}
              </h1>
              <p className="text-muted">@{profile.username}</p>
              {profile.category ? <p className="mt-1 text-sm text-muted">{profile.category}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <FollowButton username={profile.username} />
            {profile.website ? (
              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Visit Website</Button>
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <span><strong>{formatNumber(profile.listingCount)}</strong> listings</span>
          <span><strong>{formatNumber(profile.viewCount)}</strong> views</span>
          <span><strong>{formatNumber(profile.followerCount)}</strong> followers</span>
        </div>

        {profile.bio ? <p className="mt-4 max-w-2xl text-muted">{profile.bio}</p> : null}

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`/profile/${profile.username}?tab=${t.id}`}
              className={`whitespace-nowrap px-4 py-3 text-sm font-semibold ${
                tab === t.id ? "border-b-2 border-accent text-accent" : "text-muted"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="py-8">
          {tab === "about" ? (
            <div className="max-w-xl space-y-3 text-sm text-muted">
              <p><strong className="text-foreground">Category:</strong> {profile.category ?? "—"}</p>
              <p><strong className="text-foreground">Website:</strong> {profile.website ?? "—"}</p>
              <p><strong className="text-foreground">Joined:</strong> {profile.createdAt.toLocaleDateString()}</p>
            </div>
          ) : (
            <>
              {(tab === "overview" || tab === "listings") && filtered.length > 0 ? (
                <h2 className="mb-4 text-lg font-semibold">
                  {tab === "overview" ? "Featured" : "All listings"}
                </h2>
              ) : null}
              <ListingGrid>
                {(tab === "overview" ? filtered.slice(0, 6) : filtered).map((l) => (
                  <ListingCard key={l.id} listing={toListingCard(l)} />
                ))}
              </ListingGrid>
              {filtered.length === 0 ? (
                <p className="text-sm text-muted">No listings in this tab yet.</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
