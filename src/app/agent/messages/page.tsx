import { Suspense } from "react";
import type { Metadata } from "next";
import AgentMessagesPage from "@/features/agent/pages/AgentMessagesPage";

export const metadata: Metadata = {
  title: "Messages",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AgentMessagesPage />
    </Suspense>
  );
}
