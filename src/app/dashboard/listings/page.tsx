import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserListings } from "@/modules/listings/service";
import { ListingStatus } from "@prisma/client";
import { formatNumber } from "@/lib/utils";
import { ListingActions } from "@/features/dashboard/listing-actions";
import { safeDb } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function DashboardListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  const { status } = await searchParams;
  const result = await safeDb(
    () =>
      getUserListings(
        session!.user.id,
        status && status !== "ALL" ? (status as ListingStatus) : undefined,
      ),
    { items: [], total: 0, page: 1, pageSize: 24 },
  );

  const filters = ["ALL", "DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "SUSPENDED", "ARCHIVED"];

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
          Claim rank
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f}
            href={`/dashboard/listings?status=${f}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              (status ?? "ALL") === f ? "bg-foreground text-background" : "bg-muted-bg"
            }`}
          >
            {f.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-muted-bg/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Likes</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Promotion</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted-bg">
                      {l.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <div className="font-medium">{l.title}</div>
                      <div className="text-xs text-muted">{l.contentType}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{l.status}</td>
                <td className="px-4 py-3">{formatNumber(l.viewCount)}</td>
                <td className="px-4 py-3">{formatNumber(l.likeCount)}</td>
                <td className="px-4 py-3">{formatNumber(l.clickCount)}</td>
                <td className="px-4 py-3">{l.promotions[0]?.type?.replace(/_/g, " ") ?? "—"}</td>
                <td className="px-4 py-3">
                  <ListingActions listingId={l.id} slug={l.slug} status={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No listings yet — claim a rank from the homepage.</p>
        ) : null}
      </div>
    </div>
  );
}
