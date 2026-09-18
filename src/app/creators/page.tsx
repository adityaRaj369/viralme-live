import Link from "next/link";
import { CreatorCard } from "@/components/cards/listing-card";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { listCreators } from "@/modules/profiles/service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creators" };

export default async function CreatorsPage() {
  let items: Awaited<ReturnType<typeof listCreators>>["items"] = [];
  try {
    const result = await listCreators(1, 24);
    items = result.items;
  } catch {
    // empty
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Creators</h1>
      <p className="mt-2 text-muted">Storefronts and creator profiles on MakeMeViral.</p>
      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No creators yet"
            action={
              <Link href="/register">
                <Button>Create your profile</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CreatorCard key={c.id} profile={{ ...c, listingCount: c._count.listings }} />
          ))}
        </div>
      )}
    </div>
  );
}
