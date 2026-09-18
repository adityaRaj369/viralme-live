import Link from "next/link";
import { Bot, Clock3, ExternalLink, Megaphone, Sparkles, Trophy } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { logoUrlForDomain } from "@/lib/favicon";
import { categoryHrefForSlug, domainFromUrl, productHref } from "@/lib/product-path";

export type RankCardData = {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  rank: number;
  displayAmount: number;
  currency?: string;
  externalUrl?: string | null;
  clickCount: number;
  createdAt: Date;
  categoryName?: string | null;
  categorySlug?: string | null;
  domain?: string | null;
  thumbnailUrl?: string | null;
};

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "last week";
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function CategoryIcon({ name }: { name?: string | null }) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("agent")) return <Bot className="h-3 w-3" />;
  if (n.includes("seo")) return <Sparkles className="h-3 w-3" />;
  if (n.includes("market")) return <Megaphone className="h-3 w-3" />;
  return <Trophy className="h-3 w-3" />;
}

export function RankCard({
  item,
  currency = "USD",
  claimForAmount,
  claimHrefBase = "/",
}: {
  item: RankCardData;
  currency?: string;
  claimForAmount?: number;
  claimHrefBase?: string;
}) {
  const domain = item.domain ?? domainFromUrl(item.externalUrl);
  const logo = item.thumbnailUrl || (domain ? logoUrlForDomain(domain) : null);
  const headline = item.tagline ? `${item.title} · ${item.tagline}` : item.title;
  const detailsHref = productHref({
    slug: item.slug,
    domain,
    externalUrl: item.externalUrl,
  });
  const claimHref =
    claimForAmount != null
      ? `${claimHrefBase}${claimHrefBase.includes("?") ? "&" : "?"}claim=${claimForAmount}`
      : null;

  return (
    <article className="relative w-full animate-fade-up">
      {claimHref ? (
        <Link
          href={claimHref}
          className="absolute -top-3 left-4 z-10 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm sm:left-5"
        >
          claim this rank for {formatCurrency(claimForAmount!, currency)}
        </Link>
      ) : null}

      <div className={cn("ob-card w-full p-4 sm:p-5", item.rank === 1 && "pt-6")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex items-start gap-3 sm:contents">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted-bg sm:h-14 sm:w-14">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-accent">
                  {item.title.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 sm:contents">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[15px] font-extrabold text-accent sm:text-base">#{item.rank}</span>
                  <Link
                    href={detailsHref}
                    className="min-w-0 break-words text-[15px] font-bold tracking-tight hover:text-accent sm:text-base"
                  >
                    {headline}
                  </Link>
                </div>
                {item.description ? (
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted sm:line-clamp-3">
                    {item.description}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                  {item.categoryName ? (
                    <Link
                      href={categoryHrefForSlug(item.categorySlug)}
                      className="inline-flex items-center gap-1 hover:text-accent"
                    >
                      <CategoryIcon name={item.categoryName} />
                      {item.categoryName}
                    </Link>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    {timeAgo(item.createdAt)}
                  </span>
                  {domain ? <span className="truncate">{domain}</span> : null}
                  <span>{item.clickCount.toLocaleString()} clicks</span>
                  <Link href={detailsHref} className="font-medium hover:text-accent">
                    see details
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0 sm:text-right">
            <div className="text-lg font-extrabold tabular-nums text-accent sm:text-base">
              {formatCurrency(item.displayAmount, currency)}
            </div>
            {item.externalUrl ? (
              <a
                href={`/api/go/${item.slug}`}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-accent"
              >
                Visit <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
