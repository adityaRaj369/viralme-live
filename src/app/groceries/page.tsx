import { DiscoveryPage } from "@/features/discovery/discovery-page";

export const metadata = { title: "Groceries" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <DiscoveryPage
      title="Groceries"
      description="Grocery listings and everyday essentials."
      contentType="GROCERY"
      searchParams={searchParams}
      basePath="/groceries"
    />
  );
}
