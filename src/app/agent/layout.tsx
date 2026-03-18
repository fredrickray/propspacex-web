import type { Metadata } from "next";
import AgentLayout from "@/features/agent/components/AgentLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | Agent | PropSpace X",
    default: "Dashboard | Agent | PropSpace X",
  },
  description: "PropSpace X agent dashboard.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AgentLayout>{children}</AgentLayout>;
}
