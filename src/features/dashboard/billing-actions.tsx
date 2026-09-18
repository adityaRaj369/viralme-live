"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BillingActions({
  planId,
  price,
  current,
}: {
  planId: string;
  price: number;
  current?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_subscription", planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed");
        return;
      }
      if (price <= 0 || data.plan) {
        router.refresh();
        return;
      }
      if (data.checkout?.providerOrderId) {
        const verify = await fetch("/api/payments/mock-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerOrderId: data.checkout.providerOrderId }),
        });
        if (!verify.ok) {
          alert("Payment verification failed");
          return;
        }
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (current) {
    return <p className="mt-4 text-xs font-semibold text-success">Current plan</p>;
  }

  return (
    <Button className="mt-4 w-full" size="sm" disabled={loading} onClick={upgrade}>
      {loading ? "Processing…" : price <= 0 ? "Switch" : "Upgrade"}
    </Button>
  );
}
