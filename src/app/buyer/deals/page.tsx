import type { Metadata } from "next";
import BuyerDealsPage from "@/features/buyer/pages/BuyerDealsPage";

export const metadata: Metadata = {
  title: "Deals",
};

export default function Page() {
  return <BuyerDealsPage />;
}
