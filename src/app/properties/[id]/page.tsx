import type { Metadata } from "next";
import PropertyDetailsPage from "@/features/buyer/pages/PropertyDetailsPage";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9099/api/v1";
  try {
    const response = await fetch(`${base}/properties/${params.id}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return { title: "Property" };
    }
    const payload = (await response.json()) as {
      title?: string;
      property?: { title?: string };
      data?: { title?: string };
    };
    const title =
      payload.title || payload.property?.title || payload.data?.title;
    if (!title) return { title: "Property" };
    return {
      title,
      description: `${title} on PropSpace X.`,
    };
  } catch {
    return { title: "Property" };
  }
}

export default function Page() {
  return <PropertyDetailsPage />;
}
