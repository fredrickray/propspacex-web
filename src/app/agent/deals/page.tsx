import type { Metadata } from "next";
import AgentDealsPage from "@/features/agent/pages/AgentDealsPage";

export const metadata: Metadata = {
  title: "Deals",
};

export default function Page() {
  return <AgentDealsPage />;
}
