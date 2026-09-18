import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProfilesPage() {
  const profiles = await prisma.profile.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, status: true } } },
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Profiles</h1>
      <div className="mt-6 space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <strong>{p.displayName}</strong> @{p.username} · {p.user.email} · {p.listingCount} listings
          </div>
        ))}
      </div>
    </div>
  );
}
