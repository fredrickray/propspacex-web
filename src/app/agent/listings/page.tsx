import type { Metadata } from "next";
import MyListingsPage from "@/features/agent/pages/MyListingsPage";

export const metadata: Metadata = {
  title: "My Listings",
};

export default function Page() {
  return <MyListingsPage />;
}
