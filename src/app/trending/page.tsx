import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "Trending" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="Trending"
      description="Featured, sponsored, and curated placements — not ranked by likes or views."
      searchParams={searchParams}
      basePath="/trending"
      defaultFilter="trending"
    />
  );
}
