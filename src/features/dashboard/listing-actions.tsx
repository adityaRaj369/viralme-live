"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function ListingActions({
  listingId,
  slug,
  status,
}: {
  listingId: string;
  slug: string;
  status: string;
}) {
  const router = useRouter();

  async function promote() {
    const type = prompt("Promotion type: TOP_50, TOP_20, TOP_10, FEATURED, HOMEPAGE_FEATURE", "TOP_50");
    if (!type) return;
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, type }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed");
      return;
    }
    if (data.checkout?.providerOrderId) {
      const pay = await fetch("/api/payments/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerOrderId: data.checkout.providerOrderId }),
      });
      if (!pay.ok) {
        alert("Payment verification failed");
        return;
      }
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Link href={`/listing/${slug}`} className="text-xs font-semibold text-accent">
        View
      </Link>
      {status === "PUBLISHED" ? (
        <button type="button" className="text-xs font-semibold text-accent" onClick={promote}>
          Promote
        </button>
      ) : null}
    </div>
  );
}
