import Link from "next/link";
import { ContentType, MediaPlatform } from "@prisma/client";
import { ListingCard, ListingGrid } from "@/components/cards/listing-card";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { discoverListings } from "@/modules/listings/service";
import { getActivePromotedListings } from "@/modules/promotions/service";
import { toListingCard } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import type { DiscoveryFilter } from "@/modules/discovery/service";

export const dynamic = "force-dynamic";

const FILTERS: { value: DiscoveryFilter; label: string }[] = [
  { value: "trending", label: "Featured & Sponsored" },
  { value: "featured", label: "Featured" },
  { value: "sponsored", label: "Sponsored" },
  { value: "new", label: "New" },
  { value: "all", label: "All" },
];

type Props = {
  title: string;
  description: string;
  contentType?: ContentType;
  platform?: MediaPlatform;
  searchParams?: Promise<Record<string, string | undefined>>;
  basePath: string;
  defaultFilter?: DiscoveryFilter;
};

export async function DiscoveryPage({
  title,
  description,
  contentType,
  platform,
  searchParams,
  basePath,
  defaultFilter = "all",
}: Props) {
  const params = (await searchParams) ?? {};
  const filter = (params.filter as DiscoveryFilter) || defaultFilter;
  const page = Number(params.page ?? 1);

  let result = {
    items: [] as Awaited<ReturnType<typeof discoverListings>>["items"],
    total: 0,
    page,
    pageSize: 24,
    totalPages: 0,
  };
  let promoted: Awaited<ReturnType<typeof getActivePromotedListings>> = [];

  try {
    [result, promoted] = await Promise.all([
      discoverListings({
        contentType,
        platform,
        filter,
        page,
        pageSize: 24,
        categorySlug: params.category,
        q: params.q,
      }),
      getActivePromotedListings(
        title.toLowerCase().includes("trending") ? "TOP_10" : undefined,
      ),
    ]);
  } catch {
    // DB may be unavailable
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{description}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`${basePath}?filter=${f.value}`}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-sm font-medium",
              filter === f.value ? "bg-foreground text-background" : "bg-card hover:bg-muted-bg",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {promoted.length > 0 && filter !== "new" ? (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Sponsored placement
          </h2>
          <ListingGrid>
            {promoted.slice(0, 10).map((l) =>
              l ? (
                <ListingCard
                  key={l.id}
                  listing={toListingCard(l as never, l.promoted?.position)}
                />
              ) : null,
            )}
          </ListingGrid>
        </div>
      ) : null}

      <div className="mt-10">
        {result.items.length === 0 ? (
          <EmptyState
            title="No one has submitted anything here yet."
            description="List your content and choose a placement to get discovered."
            action={
              <Link href="/submit">
                <Button>List Your Content</Button>
              </Link>
            }
          />
        ) : (
          <ListingGrid>
            {result.items.map((l, i) => (
              <ListingCard
                key={l.id}
                listing={toListingCard(
                  l,
                  l.promotions[0]?.slotPosition ?? (filter === "trending" ? i + 1 : null),
                )}
              />
            ))}
          </ListingGrid>
        )}
      </div>

      {result.totalPages > 1 ? (
        <div className="mt-10 flex justify-center gap-2">
          {page > 1 ? (
            <Link href={`${basePath}?filter=${filter}&page=${page - 1}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          ) : null}
          <span className="flex items-center px-3 text-sm text-muted">
            Page {page} of {result.totalPages}
          </span>
          {page < result.totalPages ? (
            <Link href={`${basePath}?filter=${filter}&page=${page + 1}`}>
              <Button variant="outline">Next</Button>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
