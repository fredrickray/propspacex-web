import type { Metadata } from "next";
import BuyerDealDetailPage from "@/features/buyer/pages/BuyerDealDetailPage";

export const metadata: Metadata = {
  title: "Deal",
};

export default function Page() {
  return <BuyerDealDetailPage />;
}
