import type { Metadata } from "next";
import BuyerLayout from "@/features/buyer/components/BuyerLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | PropSpace X",
    default: "Dashboard | PropSpace X",
  },
  description:
    "Browse properties, manage favorites, and connect with agents on PropSpace X.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BuyerLayout>{children}</BuyerLayout>;
}
