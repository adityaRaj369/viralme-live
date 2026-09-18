import Link from "next/link";
import { SHELL } from "@/lib/shell";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "FAQ" };

const faqs = [
  {
    q: "How does ranking work?",
    a: "Rank is what you pay — nothing else. Higher amount = higher on the board. No votes, likes, or engagement.",
  },
  {
    q: "How do I claim #1?",
    a: "Pay at least the current #1 amount + $5 (the bump). Whole dollars only.",
  },
  {
    q: "What's the difference between All-time and Today?",
    a: "All-time is cumulative and never expires. Today resets every UTC midnight.",
  },
  {
    q: "Can I raise my existing listing?",
    a: "Yes. Pay the difference between your new target amount and your current amount.",
  },
  {
    q: "Do clicks affect rank?",
    a: "No. Clicks are analytics only.",
  },
  {
    q: "Is this the real payment system?",
    a: "This demo uses mock payments. Connect Postgres + Razorpay for production.",
  },
];

export default function FaqPage() {
  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">FAQ</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <details key={f.q} className="ob-card group p-5">
            <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted">
        More in <Link href="/rules" className="text-accent">Rules</Link> · {APP_NAME}
      </p>
    </div>
  );
}
