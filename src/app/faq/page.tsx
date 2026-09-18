import Link from "next/link";
import { SHELL } from "@/lib/shell";
import { adminGetContent, adminGetSettings } from "@/lib/admin-demo";

export const metadata = { title: "FAQ" };
export const dynamic = "force-dynamic";

export default function FaqPage() {
  const { faq } = adminGetContent();
  const siteName = String(adminGetSettings().siteName ?? "viralme.live");

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">FAQ</h1>
      <div className="mt-8 space-y-4">
        {faq.map((f) => (
          <details key={f.q} className="ob-card group p-5">
            <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted">
        More in <Link href="/rules" className="text-accent">Rules</Link> · {siteName}
      </p>
    </div>
  );
}
