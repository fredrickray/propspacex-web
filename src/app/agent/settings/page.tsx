import type { Metadata } from "next";
import AgentSettingsPage from "@/features/agent/pages/AgentSettingsPage";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return <AgentSettingsPage />;
}
