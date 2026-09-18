import { prisma } from "@/lib/db";
import { ReportActions } from "@/features/admin/report-actions";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { listing: true, reporter: { select: { email: true } } },
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Reports</h1>
      <div className="mt-6 space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4 text-sm">
            <div className="font-semibold">
              {r.reason} · {r.status}
            </div>
            <p className="mt-1 text-muted">
              {r.listing.title} · reported by {r.reporter.email}
            </p>
            <ReportActions reportId={r.id} />
          </div>
        ))}
        {reports.length === 0 ? <p className="text-muted">No reports.</p> : null}
      </div>
    </div>
  );
}
