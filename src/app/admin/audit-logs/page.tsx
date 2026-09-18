import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { email: true } } },
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Audit Logs</h1>
      <div className="mt-6 space-y-2">
        {logs.map((l) => (
          <div key={l.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="text-muted">{l.createdAt.toLocaleString()}</span> · {l.actor?.email ?? "system"} ·{" "}
            {l.action} · {l.entityType}/{l.entityId}
          </div>
        ))}
        {logs.length === 0 ? <p className="text-muted">No audit events yet.</p> : null}
      </div>
    </div>
  );
}
