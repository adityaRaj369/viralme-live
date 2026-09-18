import { listPendingModeration } from "@/modules/moderation/service";
import { ModerationActions } from "@/features/admin/moderation-actions";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const data = await listPendingModeration();

  return (
    <div>
      <h1 className="text-3xl font-bold">Moderation</h1>
      <p className="mt-2 text-sm text-muted">{data.total} pending listings</p>
      <div className="mt-8 space-y-4">
        {data.items.map((l) => (
          <div key={l.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{l.title}</h3>
                <p className="mt-1 text-sm text-muted line-clamp-2">{l.description}</p>
                <p className="mt-2 text-xs text-muted">
                  @{l.profile.username} · {l.owner.email} · {l.contentType}
                </p>
              </div>
              <ModerationActions listingId={l.id} />
            </div>
          </div>
        ))}
        {data.items.length === 0 ? <p className="text-muted">Queue is clear.</p> : null}
      </div>
    </div>
  );
}
