"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";

type Category = { id: string; name: string; slug: string };
type PromoProduct = { type: string; name: string; price: string; durationHours: number; description?: string };

const CONTENT_TYPES = ["PRODUCT", "VIDEO", "FOOD", "GROCERY", "DEAL", "CREATOR", "APP", "SERVICE", "OTHER"];

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<PromoProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contentType: "PRODUCT",
    title: "",
    description: "",
    originalUrl: "",
    categoryIds: [] as string[],
    price: "",
    currency: "INR",
    location: "",
    tags: "",
    thumbnailUrl: "",
    creatorHandle: "",
    visibility: "STANDARD",
  });

  useEffect(() => {
    fetch("/api/me?resource=categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => undefined);
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((d) => setPromos(d.products ?? []))
      .catch(() => undefined);
  }, []);

  const preview = useMemo(() => {
    const url = form.originalUrl;
    let platform = "EXTERNAL";
    if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "YOUTUBE";
    if (url.includes("instagram.com")) platform = "INSTAGRAM";
    return { platform, title: form.title || "Untitled listing", description: form.description };
  }, [form]);

  async function submit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        contentType: form.contentType,
        originalUrl: form.originalUrl,
        categoryIds: form.categoryIds,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
        location: form.location || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        thumbnailUrl: form.thumbnailUrl,
        creatorHandle: form.creatorHandle || null,
        submitForReview: true,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Could not create listing");
      if (data.code === "LISTING_LIMIT_REACHED") {
        setError(`${data.error} Upgrade your profile to continue.`);
      }
      return;
    }

    if (form.visibility !== "STANDARD") {
      const promoRes = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: data.listing.id, type: form.visibility }),
      });
      const promoData = await promoRes.json();
      if (promoRes.ok && promoData.checkout?.providerOrderId) {
        // Complete mock payment server-side
        await fetch("/api/payments/mock-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerOrderId: promoData.checkout.providerOrderId }),
        });
      }
    }

    setStep(6);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Submit a listing</h1>
      <p className="mt-2 text-muted">Multi-step flow with preview and optional promotion.</p>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-muted-bg"}`}
          />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Choose category type</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, contentType: t })}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                    form.contentType === t ? "border-accent bg-accent-soft text-accent" : "border-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Enter content</h2>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                type="url"
                placeholder="https://"
                value={form.originalUrl}
                onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              />
            </div>
            <div>
              <Label>Categories</Label>
              <Select
                value={form.categoryIds[0] ?? ""}
                onChange={(e) => setForm({ ...form, categoryIds: e.target.value ? [e.target.value] : [] })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              />
            </div>
            <div>
              <Label>Creator handle</Label>
              <Input
                value={form.creatorHandle}
                onChange={(e) => setForm({ ...form, creatorHandle: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!form.title || form.categoryIds.length === 0}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="rounded-xl border border-border bg-muted-bg p-4">
              <div className="text-xs font-semibold uppercase text-muted">{preview.platform}</div>
              <div className="mt-2 text-lg font-semibold">{preview.title}</div>
              <p className="mt-1 text-sm text-muted">{preview.description || "No description"}</p>
              {form.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.thumbnailUrl} alt="" className="mt-4 aspect-video w-full rounded-lg object-cover" />
              ) : null}
            </div>
            <div>
              <Label>Edit title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Visibility</h2>
            <button
              type="button"
              onClick={() => setForm({ ...form, visibility: "STANDARD" })}
              className={`w-full rounded-xl border p-4 text-left ${
                form.visibility === "STANDARD" ? "border-accent bg-accent-soft" : "border-border"
              }`}
            >
              <div className="font-semibold">Standard</div>
              <p className="text-sm text-muted">Normal listing placement. No promotional slot.</p>
            </button>
            {promos.map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => setForm({ ...form, visibility: p.type })}
                className={`w-full rounded-xl border p-4 text-left ${
                  form.visibility === p.type ? "border-accent bg-accent-soft" : "border-border"
                }`}
              >
                <div className="font-semibold">{p.name}</div>
                <p className="text-sm text-muted">
                  Paid placement · ₹{Number(p.price)} · {p.durationHours}h · labeled Sponsored
                </p>
              </button>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(form.visibility === "STANDARD" ? 6 : 5)}>
                {form.visibility === "STANDARD" ? "Submit" : "Continue to payment"}
              </Button>
            </div>
            {form.visibility === "STANDARD" ? (
              <Button className="w-full" disabled={loading} onClick={submit}>
                {loading ? "Submitting…" : "Submit for review"}
              </Button>
            ) : null}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="text-sm text-muted">
              Payment is created on the server and verified before activation. Client-side success alone never
              activates a promotion.
            </p>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button disabled={loading} onClick={submit}>
                {loading ? "Processing…" : "Pay & submit"}
              </Button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-semibold">Submitted</h2>
            <p className="text-sm text-muted">
              Your listing is pending review. You&apos;ll be notified when it&apos;s approved.
            </p>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="flex justify-center gap-2">
              <Button onClick={() => router.push("/dashboard/listings")}>Go to My Listings</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
              >
                Submit another
              </Button>
            </div>
          </div>
        )}

        {error && step !== 6 ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>
    </div>
  );
}
