import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "YouTube Shorts" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="YouTube Shorts"
      description="Shorts listed for visibility via paid and curated placement."
      contentType="VIDEO"
      platform="YOUTUBE_SHORTS"
      searchParams={searchParams}
      basePath="/youtube-shorts"
    />
  );
}
