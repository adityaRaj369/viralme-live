"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReportButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [done, setDone] = useState(false);

  async function submit() {
    const res = await fetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "report", listingId, reason }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      setDone(true);
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Report
      </Button>
      {done ? <span className="text-sm text-muted">Report submitted</span> : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Report listing</h3>
            <select
              className="mt-4 h-11 w-full rounded-xl border border-border px-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {["SPAM", "SCAM", "COPYRIGHT", "INAPPROPRIATE", "MISLEADING", "BROKEN_LINK", "OTHER"].map(
                (r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ),
              )}
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit}>Submit report</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
