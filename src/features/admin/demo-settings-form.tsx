"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Settings = Record<string, string | number | boolean>;

export function DemoSettingsForm() {
  const router = useRouter();
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    void fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((d) => setS(d.settings ?? {}));
  }, []);

  if (!s) return <p className="mt-6 text-sm text-muted">Loading settings…</p>;

  function field(key: string, label: string, type: "text" | "number" = "text") {
    return (
      <div key={key}>
        <Label htmlFor={key}>{label}</Label>
        <Input
          id={key}
          type={type}
          value={String(s![key] ?? "")}
          onChange={(e) =>
            setS({
              ...s!,
              [key]: type === "number" ? Number(e.target.value) : e.target.value,
            })
          }
        />
      </div>
    );
  }

  return (
    <form
      className="mt-8 max-w-lg space-y-4 rounded-2xl border border-border bg-card p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg("");
        setErr("");
        const res = await fetch("/api/admin/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: s }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErr(data.error ?? "Save failed");
          return;
        }
        setS(data.settings);
        setMsg("Saved — public site uses these values immediately.");
        router.refresh();
      }}
    >
      <h2 className="font-semibold">Site & claim settings</h2>
      <p className="text-xs text-muted">
        Controls brand labels and claim #1 pricing on the public leaderboard.
      </p>
      {field("siteName", "Site name")}
      {field("tagline", "Tagline")}
      {field("supportEmail", "Support email")}
      {field("region", "Region label")}
      {field("rankCurrency", "Currency (e.g. INR)")}
      {field("rankMinAmount", "Minimum claim amount", "number")}
      {field("rankBumpAmount", "Bump over current #1", "number")}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(s.enablePaidPromotions)}
          onChange={(e) => setS({ ...s, enablePaidPromotions: e.target.checked })}
        />
        Enable paid promotions
      </label>
      {err ? <p className="text-sm text-danger">{err}</p> : null}
      {msg ? <p className="text-sm text-success">{msg}</p> : null}
      <Button type="submit">Save settings</Button>
    </form>
  );
}
