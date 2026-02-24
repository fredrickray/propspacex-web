import type { Metadata } from "next";
import ContactAgentPage from "@/features/buyer/pages/ContactAgentPage";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: "Contact Agent",
    description: "Get in touch with the listing agent for this property.",
  };
}

export default function Page() {
  return <ContactAgentPage />;
}
