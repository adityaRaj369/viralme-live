"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function SettingsAdminForm({
  settings,
  flags,
}: {
  settings: Record<string, unknown>;
  flags: { id: string; key: string; enabled: boolean; description?: string | null }[];
}) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(String(settings.siteName ?? "MakeMeViral"));

  return (
    <div className="mt-8 space-y-8">
      <form
        className="max-w-md space-y-3 rounded-2xl border border-border bg-card p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "set_setting", key: "siteName", value: siteName }),
          });
          router.refresh();
        }}
      >
        <Label>Site name</Label>
        <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
        <Button type="submit" size="sm">
          Save
        </Button>
      </form>

      <div className="space-y-2">
        <h2 className="font-semibold">Feature flags</h2>
        {flags.map((f) => (
          <button
            key={f.id}
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm"
            onClick={async () => {
              await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "set_flag", key: f.key, enabled: !f.enabled }),
              });
              router.refresh();
            }}
          >
            <span>
              {f.key}
              <span className="mt-1 block text-xs text-muted">{f.description}</span>
            </span>
            <span className={f.enabled ? "text-success" : "text-muted"}>
              {f.enabled ? "ON" : "OFF"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
