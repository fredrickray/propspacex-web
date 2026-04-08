import type { Metadata } from "next";
import AgentWalletPage from "@/features/agent/pages/AgentWalletPage";

export const metadata: Metadata = {
  title: "Wallet & payouts",
};

export default function Page() {
  return <AgentWalletPage />;
}
