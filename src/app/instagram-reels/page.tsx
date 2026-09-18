import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "Instagram Reels" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="Instagram Reels"
      description="Reels listed for discovery. Placement is promotional — not vote-based."
      contentType="VIDEO"
      platform="INSTAGRAM"
      searchParams={searchParams}
      basePath="/instagram-reels"
    />
  );
}
