"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function ClaimRankBox({
  claimPrice,
  currency = "INR",
  defaultCategoryId,
  lockedCategoryLabel,
}: {
  claimPrice: number;
  currency?: string;
  categories?: { id: string; name: string; slug: string }[];
  defaultCategoryId?: string;
  lockedCategoryLabel?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState(claimPrice);
  const [urlOrHandle, setUrlOrHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    const fromQuery = Number(searchParams.get("claim"));
    if (fromQuery > 0) setAmount(fromQuery);
    else setAmount(claimPrice);
  }, [claimPrice, searchParams]);

  const display = useMemo(() => formatCurrency(amount, currency), [amount, currency]);

  async function claim() {
    setLoading(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlOrHandle,
          amount,
          categoryId: defaultCategoryId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create claim");
        return;
      }
      if (data.checkout?.providerOrderId) {
        const pay = await fetch("/api/payments/mock-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerOrderId: data.checkout.providerOrderId }),
        });
        if (!pay.ok) {
          const payData = await pay.json().catch(() => ({}));
          setError(payData.error ?? "Payment verification failed");
          return;
        }
      }
      setOk("Rank claimed — you're on the board.");
      setUrlOrHandle("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ob-card w-full animate-fade-up p-5 sm:p-7">
      {lockedCategoryLabel ? (
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-accent">
          Paying for · {lockedCategoryLabel}
        </p>
      ) : null}
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-[30px]">
          Claim #1 for
        </h2>
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-1">
          <button
            type="button"
            aria-label="Decrease amount"
            className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition hover:bg-accent-soft"
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            id="claim-amount"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
            className="w-[7.5rem] bg-transparent text-center text-2xl font-extrabold tabular-nums text-accent outline-none sm:text-[30px]"
            aria-label="Amount"
          />
          <button
            type="button"
            aria-label="Increase amount"
            className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition hover:bg-accent-soft"
            onClick={() => setAmount((a) => a + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="w-full text-center text-xs text-muted sm:hidden">{display}</p>
      </div>

      <div className="relative mt-5">
        <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-4 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Your product URL or @handle"
          value={urlOrHandle}
          onChange={(e) => setUrlOrHandle(e.target.value)}
          required
        />
      </div>

      {error ? <p className="mt-3 text-center text-sm text-danger">{error}</p> : null}
      {ok ? <p className="mt-3 text-center text-sm text-success">{ok}</p> : null}

      <Button
        className="mt-4 h-12 w-full rounded-full text-[15px]"
        disabled={loading || !urlOrHandle.trim()}
        onClick={claim}
      >
        {loading ? "Claiming…" : "Claim rank"}
      </Button>
    </div>
  );
}
