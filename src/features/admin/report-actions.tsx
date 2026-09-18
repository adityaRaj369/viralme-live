"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  async function resolve(status: "RESOLVED" | "DISMISSED", suspendListing = false) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve_report", reportId, status, suspendListing }),
    });
    router.refresh();
  }
  return (
    <div className="mt-3 flex gap-2">
      <Button size="sm" onClick={() => resolve("RESOLVED")}>
        Resolve
      </Button>
      <Button size="sm" variant="outline" onClick={() => resolve("DISMISSED")}>
        Dismiss
      </Button>
      <Button size="sm" variant="danger" onClick={() => resolve("RESOLVED", true)}>
        Suspend listing
      </Button>
    </div>
  );
}
