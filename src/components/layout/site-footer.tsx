"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SHELL } from "@/lib/shell";
import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  const links = [
    { href: "/rules", label: "Rules" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/imprint", label: "Imprint" },
    { href: "/stats", label: "Live stats" },
  ];
  const [siteName, setSiteName] = useState(APP_NAME);
  const [footerBlurb, setFooterBlurb] = useState(
    "a public pay-to-rank leaderboard. Rank is what you pay — nothing else.",
  );

  useEffect(() => {
    void fetch("/api/public/site")
      .then((r) => r.json())
      .then((d) => {
        if (d.siteName) setSiteName(String(d.siteName));
        if (d.footerBlurb) setFooterBlurb(String(d.footerBlurb));
      })
      .catch(() => undefined);
  }, []);

  return (
    <footer className="mt-auto w-full border-t border-border/70">
      <div className={`${SHELL} flex flex-col gap-6 py-12`}>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-sm text-muted">
              <strong className="text-foreground">{siteName}</strong> — {footerBlurb}
            </p>
            <p className="mt-3 text-xs text-muted">
              Built as a simple side project. No ads. No engagement ranking.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap gap-4 text-[13px] text-muted">
          <Link href="/" className="hover:text-foreground">
            Leaderboard
          </Link>
          <Link href="/daily" className="hover:text-foreground">
            Daily
          </Link>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {siteName}
        </p>
      </div>
    </footer>
  );
}
