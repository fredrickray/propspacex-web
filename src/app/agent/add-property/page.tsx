import type { Metadata } from "next";
import AddPropertyBasicInfoPage from "@/features/agent/pages/AddPropertyBasicInfoPage";

export const metadata: Metadata = {
  title: "Add Property",
};

export default function Page() {
  return <AddPropertyBasicInfoPage />;
}
