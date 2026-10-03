import type { Metadata } from "next";
import EditListingPage from "@/features/agent/pages/EditListingPage";

export const metadata: Metadata = {
  title: "Edit listing",
};

export default function Page() {
  return <EditListingPage />;
}
