import type { Metadata } from "next";
import BuyerWalletPage from "@/features/buyer/pages/BuyerWalletPage";

export const metadata: Metadata = {
  title: "Wallet",
};

export default function Page() {
  return <BuyerWalletPage />;
}
