import type { Metadata } from "next";
import AddPropertyLocationPage from "@/features/agent/pages/AddPropertyLocationPage";

export const metadata: Metadata = {
  title: "Add Property | Location",
};

export default function Page() {
  return <AddPropertyLocationPage />;
}
