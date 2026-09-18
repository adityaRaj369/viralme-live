import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "Food" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="Food"
      description="Food finds and listings."
      contentType="FOOD"
      searchParams={searchParams}
      basePath="/food"
    />
  );
}
