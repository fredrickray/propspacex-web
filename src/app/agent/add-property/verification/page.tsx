import type { Metadata } from "next";
import AddPropertyVerificationPage from "@/features/agent/pages/AddPropertyVerificationPage";

export const metadata: Metadata = {
  title: "Add Property | Verification",
};

export default function Page() {
  return <AddPropertyVerificationPage />;
}
