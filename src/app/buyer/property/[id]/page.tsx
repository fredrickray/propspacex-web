import type { Metadata } from "next";
import PropertyDetailsPage from "@/features/buyer/pages/PropertyDetailsPage";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // TODO: Fetch property title from API using params.id
  return {
    title: `Property ${params.id}`,
    description:
      "View property details, photos, amenities, and agent information on PropSpace X.",
  };
}

export default function Page() {
  return <PropertyDetailsPage />;
}
