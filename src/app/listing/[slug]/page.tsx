import { redirect } from "next/navigation";
import { demoFindBySlug, useDemoStore } from "@/lib/demo-store";
import { domainFromUrl, productHref } from "@/lib/product-path";

export const dynamic = "force-dynamic";

/** Legacy /listing/[slug] → /product/{domain} */
export default async function LegacyListingRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (useDemoStore()) {
    const demo = demoFindBySlug(slug);
    if (demo) {
      redirect(
        productHref({
          slug: demo.slug,
          domain: domainFromUrl(demo.externalUrl),
          externalUrl: demo.externalUrl,
        }),
      );
    }
  }
  redirect(`/product/${slug}`);
}
