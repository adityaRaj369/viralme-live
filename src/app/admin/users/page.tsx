import { adminListUsers } from "@/modules/admin/service";
import { AdminUserActions } from "@/features/admin/user-actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const data = await adminListUsers(q);

  return (
    <div>
      <h1 className="text-3xl font-bold">Users</h1>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email, name, username"
          className="h-11 w-full max-w-md rounded-xl border border-border bg-card px-3 text-sm"
        />
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-card text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Listings</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div>{u.email}</div>
                  <div className="text-xs text-muted">@{u.profile?.username}</div>
                </td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.status}</td>
                <td className="px-4 py-3">{u.subscription?.plan.name ?? "—"}</td>
                <td className="px-4 py-3">{u._count.listings}</td>
                <td className="px-4 py-3">
                  <AdminUserActions userId={u.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
