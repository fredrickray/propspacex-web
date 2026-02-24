import type { Metadata } from "next";
import { DashboardPage } from "@/features/buyer";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Page() {
  return <DashboardPage />;
}
