import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "Deals" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="Deals"
      description="Deals and offers promoted for visibility."
      contentType="DEAL"
      searchParams={searchParams}
      basePath="/deals"
    />
  );
}
