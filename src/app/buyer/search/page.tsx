import type { Metadata } from "next";
import PropertySearchPage from "@/features/buyer/pages/PropertySearchPage";

export const metadata: Metadata = {
  title: "Search Properties",
  description:
    "Search and filter verified real estate listings on PropSpace X.",
};

export default function Page() {
  return <PropertySearchPage />;
}
