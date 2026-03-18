import type { Metadata } from "next";
import AddPropertyReviewPage from "@/features/agent/pages/AddPropertyReviewPage";

export const metadata: Metadata = {
  title: "Add Property | Review & Publish",
};

export default function Page() {
  return <AddPropertyReviewPage />;
}
