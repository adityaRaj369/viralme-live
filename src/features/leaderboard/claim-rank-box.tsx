"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Globe, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export type ClaimCategoryOption = {
  id: string;
  name: string;
  fullName: string;
  slug: string;
};

export function ClaimRankBox({
  claimPrice,
  currency = "INR",
  categories = [],
  defaultCategoryId,
  lockedCategoryLabel,
}: {
  claimPrice: number;
  currency?: string;
  categories?: ClaimCategoryOption[];
  defaultCategoryId?: string;
  /** When set (category board), claim is locked to that board — no free select */
  lockedCategoryLabel?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState(claimPrice);
  const [urlOrHandle, setUrlOrHandle] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const selectable = categories.filter((c) => c.slug !== "all");
  const locked = Boolean(lockedCategoryLabel);

  useEffect(() => {
    const fromQuery = Number(searchParams.get("claim"));
    if (fromQuery > 0) setAmount(fromQuery);
    else setAmount(claimPrice);
  }, [claimPrice, searchParams]);

  useEffect(() => {
    if (defaultCategoryId) setCategoryId(defaultCategoryId);
  }, [defaultCategoryId]);

  const display = useMemo(() => formatCurrency(amount, currency), [amount, currency]);

  const selected = selectable.find((c) => c.id === categoryId);
  const headlineCategory = locked
    ? lockedCategoryLabel
    : selected
      ? selected.fullName
      : null;

  async function claim() {
    if (!locked && !categoryId) {
      setError("Choose a category");
      return;
    }
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
          categoryId: categoryId || defaultCategoryId || undefined,
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
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-[30px]">
          {headlineCategory ? (
            <>
              Claim #1 in <span className="text-accent">{headlineCategory}</span> for
            </>
          ) : (
            <>Claim #1 for</>
          )}
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

      <div className="mx-auto mt-5 flex w-full max-w-xl flex-col gap-3">
        {!locked && selectable.length > 0 ? (
          <label className="relative block">
            <span className="sr-only">Category</span>
            <select
              aria-label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="h-12 w-full appearance-none rounded-full border border-border bg-background py-2 pl-4 pr-11 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Choose a category</option>
              {selectable.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </label>
        ) : null}

        {locked ? (
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-accent">
            Paying for · {lockedCategoryLabel}
          </p>
        ) : null}

        <div className="relative">
          <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-4 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Your product URL or @handle"
            value={urlOrHandle}
            onChange={(e) => setUrlOrHandle(e.target.value)}
            required
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-center text-sm text-danger">{error}</p> : null}
      {ok ? <p className="mt-3 text-center text-sm text-success">{ok}</p> : null}

      <Button
        className="mx-auto mt-4 flex h-12 w-full max-w-xl rounded-full text-[15px]"
        disabled={loading || !urlOrHandle.trim() || (!locked && !categoryId)}
        onClick={claim}
      >
        {loading ? "Claiming…" : "Claim rank"}
      </Button>
    </div>
  );
}
