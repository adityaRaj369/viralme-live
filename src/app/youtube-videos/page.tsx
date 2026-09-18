import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "YouTube Videos" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="YouTube Videos"
      description="Full YouTube videos listed for discovery."
      contentType="VIDEO"
      platform="YOUTUBE"
      searchParams={searchParams}
      basePath="/youtube-videos"
    />
  );
}
