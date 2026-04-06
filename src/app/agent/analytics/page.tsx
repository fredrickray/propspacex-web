import type { Metadata } from "next";
import AnalyticsPage from "@/features/agent/pages/AnalyticsPage";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function Page() {
  return <AnalyticsPage />;
}
