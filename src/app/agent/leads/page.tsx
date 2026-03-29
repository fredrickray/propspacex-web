import type { Metadata } from "next";
import LeadsPage from "@/features/agent/pages/LeadsPage";

export const metadata: Metadata = {
  title: "Leads",
};

export default function Page() {
  return <LeadsPage />;
}
