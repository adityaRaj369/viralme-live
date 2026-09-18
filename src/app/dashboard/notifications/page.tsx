import { auth } from "@/lib/auth";
import { listNotifications } from "@/modules/notifications/service";
import { MarkReadButton } from "@/features/dashboard/mark-read-button";
import { safeDb } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  const data = await safeDb(() => listNotifications(session!.user.id), {
    items: [],
    unread: 0,
    total: 0,
    page: 1,
    pageSize: 20,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <MarkReadButton />
      </div>
      <p className="mt-2 text-sm text-muted">{data.unread} unread</p>
      <ul className="mt-8 space-y-3">
        {data.items.map((n) => (
          <li
            key={n.id}
            className={`rounded-2xl border border-border p-4 ${n.isRead ? "bg-card" : "bg-accent-soft/40"}`}
          >
            <div className="font-semibold">{n.title}</div>
            <p className="mt-1 text-sm text-muted">{n.body}</p>
            <p className="mt-2 text-xs text-muted">{n.createdAt.toLocaleString()}</p>
          </li>
        ))}
        {data.items.length === 0 ? <li className="text-sm text-muted">No notifications.</li> : null}
      </ul>
    </div>
  );
}
