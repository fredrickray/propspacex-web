import type { Metadata } from "next";
import AddPropertyAmenitiesPage from "@/features/agent/pages/AddPropertyAmenitiesPage";

export const metadata: Metadata = {
  title: "Add Property | Amenities",
};

export default function Page() {
  return <AddPropertyAmenitiesPage />;
}
