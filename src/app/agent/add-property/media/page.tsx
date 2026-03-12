import type { Metadata } from "next";
import AddPropertyMediaPage from "@/features/agent/pages/AddPropertyMediaPage";

export const metadata: Metadata = {
  title: "Add Property | Media",
};

export default function Page() {
  return <AddPropertyMediaPage />;
}
