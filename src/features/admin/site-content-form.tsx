"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { SiteContent } from "@/lib/admin-demo";

export function SiteContentForm() {
  const router = useRouter();
  const [c, setC] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<"about" | "faq" | "rules" | "legal" | "footer">("about");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    void fetch("/api/admin/site-content")
      .then((r) => r.json())
      .then((d) => setC(d.content));
  }, []);

  if (!c) return <p className="mt-6 text-sm text-muted">Loading content…</p>;

  async function save() {
    setMsg("");
    setErr("");
    const res = await fetch("/api/admin/site-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: c }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error ?? "Save failed");
      return;
    }
    setC(data.content);
    setMsg("Saved — public pages updated.");
    router.refresh();
  }

  const tabs = [
    { id: "about" as const, label: "About" },
    { id: "faq" as const, label: "FAQ" },
    { id: "rules" as const, label: "Rules" },
    { id: "legal" as const, label: "Legal" },
    { id: "footer" as const, label: "Footer / Home" },
  ];

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              tab === t.id ? "bg-accent text-white" : "bg-muted-bg text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "about" ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <Label>About intro</Label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={c.aboutIntro}
            onChange={(e) => setC({ ...c, aboutIntro: e.target.value })}
          />
          <Label>Closing line</Label>
          <textarea
            className="min-h-20 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={c.aboutAfterLive}
            onChange={(e) => setC({ ...c, aboutAfterLive: e.target.value })}
          />
          <Label>Testimonials (JSON array)</Label>
          <textarea
            className="min-h-40 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs"
            value={JSON.stringify(c.testimonials, null, 2)}
            onChange={(e) => {
              try {
                setC({ ...c, testimonials: JSON.parse(e.target.value) });
                setErr("");
              } catch {
                setErr("Invalid testimonials JSON");
              }
            }}
          />
        </div>
      ) : null}

      {tab === "faq" ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <Label>FAQ (JSON array of {"{q, a}"})</Label>
          <textarea
            className="min-h-80 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs"
            value={JSON.stringify(c.faq, null, 2)}
            onChange={(e) => {
              try {
                setC({ ...c, faq: JSON.parse(e.target.value) });
                setErr("");
              } catch {
                setErr("Invalid FAQ JSON");
              }
            }}
          />
        </div>
      ) : null}

      {tab === "rules" ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <Label>Rules (one per line)</Label>
          <textarea
            className="min-h-60 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={c.rules.join("\n")}
            onChange={(e) =>
              setC({
                ...c,
                rules: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
              })
            }
          />
        </div>
      ) : null}

      {tab === "legal" ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <Label>Terms</Label>
          <textarea
            className="min-h-32 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={c.terms}
            onChange={(e) => setC({ ...c, terms: e.target.value })}
          />
          <Label>Privacy</Label>
          <textarea
            className="min-h-32 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={c.privacy}
            onChange={(e) => setC({ ...c, privacy: e.target.value })}
          />
          <Label>Imprint</Label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={c.imprint}
            onChange={(e) => setC({ ...c, imprint: e.target.value })}
          />
        </div>
      ) : null}

      {tab === "footer" ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <Label>Footer blurb</Label>
          <Input
            value={c.footerBlurb}
            onChange={(e) => setC({ ...c, footerBlurb: e.target.value })}
          />
          <Label>Home empty-state text</Label>
          <Input
            value={c.homeEmpty}
            onChange={(e) => setC({ ...c, homeEmpty: e.target.value })}
          />
        </div>
      ) : null}

      {err ? <p className="text-sm text-danger">{err}</p> : null}
      {msg ? <p className="text-sm text-success">{msg}</p> : null}
      <Button type="button" onClick={() => void save()}>
        Save content
      </Button>
    </div>
  );
}
