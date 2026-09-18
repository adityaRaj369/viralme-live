"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MarkReadButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await fetch("/api/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_read" }),
        });
        router.refresh();
      }}
    >
      Mark all read
    </Button>
  );
}
