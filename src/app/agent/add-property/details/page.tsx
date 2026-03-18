import type { Metadata } from "next";
import AddPropertyDetailsPage from "@/features/agent/pages/AddPropertyDetailsPage";

export const metadata: Metadata = {
  title: "Add Property | Details",
};

export default function Page() {
  return <AddPropertyDetailsPage />;
}
