import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "Products" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="Products"
      description="Discover products listed for visibility on MakeMeViral."
      contentType="PRODUCT"
      searchParams={searchParams}
      basePath="/products"
    />
  );
}
