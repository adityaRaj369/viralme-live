import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } }, order: true },
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Payments</h1>
      <div className="mt-6 space-y-2">
        {payments.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            {p.user.email} · {p.status} · {formatCurrency(Number(p.amount), p.currency)} · {p.order.type} ·{" "}
            {p.provider}
          </div>
        ))}
      </div>
    </div>
  );
}
