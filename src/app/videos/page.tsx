import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "Videos" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="Videos"
      description="YouTube videos, Shorts, and Instagram Reels — officially embedded."
      contentType="VIDEO"
      searchParams={searchParams}
      basePath="/videos"
    />
  );
}
