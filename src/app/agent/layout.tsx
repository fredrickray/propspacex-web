import type { Metadata } from "next";
import AgentLayout from "@/features/agent/components/AgentLayout";
import { PropertyCreationProvider } from "../../features/agent/context/PropertyCreationContext";

export const metadata: Metadata = {
  title: {
    template: "%s | Agent | PropSpace X",
    default: "Dashboard | Agent | PropSpace X",
  },
  description: "PropSpace X agent dashboard.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PropertyCreationProvider>
      <AgentLayout>{children}</AgentLayout>
    </PropertyCreationProvider>
  );
}
