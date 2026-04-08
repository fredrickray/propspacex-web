import type { Metadata } from "next";
import AgentDealDetailPage from "@/features/agent/pages/AgentDealDetailPage";

export const metadata: Metadata = {
  title: "Deal",
};

export default function Page() {
  return <AgentDealDetailPage />;
}
